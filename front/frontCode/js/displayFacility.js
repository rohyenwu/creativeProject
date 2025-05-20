function getSelectedDropdownValue() {
    // 공공시설 드롭다운
    const facilityDropdownFacility = document.getElementById("facilityDropdownFacility");
    const facilityDropdownCommunity = document.getElementById("facilityDropdownCommunity");

    // 공공시설이 보이는 경우
    if (facilityDropdownFacility.style.display !== "none") {
        const select = facilityDropdownFacility.querySelector("select");
        return select.value || "전체 선택";
    }

    // 여가시설이 보이는 경우
    if (facilityDropdownCommunity.style.display !== "none") {
        const select = facilityDropdownCommunity.querySelector("select");
        return select.value || "전체 선택";
    }

    // 아무 드롭다운도 보이지 않으면 null
    return "전체 선택";
}

async function requestFacilities() {
    const dropdownValue = getSelectedDropdownValue();
    try {
        // category, lat, lng 변수는 이미 정의되어 있다고 가정
        // 주소 검색으로 얻은 위도, 경도 기준 사용 - MainPageSetting.js
        // categoryID - mainPage의 버튼
        // type - mainPage의 드롭다운
        const payload = {
            lat: parseFloat(currentLat),
            lon: parseFloat(currentLng),
            categoryID: currCategory,
            type: dropdownValue // 적절한 타입 문자열 입력 (예: 'hospital', 'restaurant' 등)
        };
        const response = await fetch("http://localhost:8000/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log(payload);

        if (!response.ok) throw new Error("서버 요청 실패");

        const facilityList = await response.json();
        console.log("서버 응답:", facilityList);

        window.facilities = facilityList;
        displayFacilitiesOnMap(facilityList);
        displayFacilitiesBelowMap(facilityList);

    } catch (error) {
        console.error("시설 데이터를 불러오지 못했습니다:", error);
    }
}

function displayFacilitiesOnMap(response) {

    const facilities = response[1]; // 실제 시설 배열

    // 기존 마커 제거
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    // 시설 마커 추가
    facilities.forEach(fac => {
        if (!fac.latitude || !fac.longitude) {
            console.warn("좌표 없음:", fac.name);
            return;
        }

        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(fac.latitude, fac.longitude),
            map: map
        });

        const info = new kakao.maps.InfoWindow({
            content: `<div>${fac.name}<br>${fac.address}</div>`
        });

        kakao.maps.event.addListener(marker, "click", () => {
            info.open(map, marker);
        });

        window.markers.push(marker);
    });
}



function displayFacilitiesBelowMap(facilityList) {
    const publicFacilities = facilityList[1]; // categoryID: 1
    const container = document.getElementById("publicFacilityCardsContainer");

    if (!Array.isArray(publicFacilities) || publicFacilities.length === 0) return;

    // 섹션 보이도록 설정
    document.getElementById("publicFacilityResultsSection").style.display = "block";

    // 기존 내용 비우기
    container.innerHTML = "";

    publicFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-primary fw-bolder mb-2">${facility.name}</div>
                            <div class="small fw-bolder">유형: ${facility.type || '정보 없음'}</div>
                            <div class="small text-muted">휴관일: ${facility.closedDays || '없음'}</div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="mb-2"><strong>주소:</strong> ${facility.address || '정보 없음'}</div>
                        <div class="mb-2"><strong>전화번호:</strong> ${facility.call || '없음'}</div>
                        <div class="mb-2"><strong>운영시간(평일):</strong> ${formatTime(facility.weekOpenTime)} ~ ${formatTime(facility.weekClosedTime)}</div>
                        <div class="mb-2"><strong>홈페이지:</strong> ${facility.homepageAddress ? `<a href="${facility.homepageAddress}" target="_blank">${facility.homepageAddress}</a>` : '없음'}</div>
                        <div><strong>유료 여부:</strong> ${facility.isPayed === 1 ? "유료" : "무료"}</div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// 시간을 초 단위 숫자에서 HH:MM 형식으로 변환
function formatTime(seconds) {
    if (!seconds || seconds === 0) return "-";
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
