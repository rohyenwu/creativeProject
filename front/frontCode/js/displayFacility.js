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
    return null;
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

function displayFacilitiesOnMap(facilities) {
    // 기존 마커 제거
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    // 시설 마커 추가
    facilities.forEach(fac => {
        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(fac.lat, fac.lng),
            map: map
        });

        const info = new kakao.maps.InfoWindow({
            content: `<div>${f.name}<br>${f.details}</div>`
        });
        kakao.maps.event.addListener(marker, "click", () => {
            info.open(map, marker);
        });
        window.markers.push(marker);
    });
}

/**
 * 지정된 컨테이너에 시설 목록을 카드 형태로 표시합니다.
 * @param {Array<Object>} facilities - 시설 정보 객체 배열
 * @param {string} containerId - 카드를 추가할 HTML 요소의 ID
 */
function displayFacilitiesBelowMap(facilities, containerId) {
    // 1. 카드들을 담을 부모 컨테이너 DOM 요소를 가져옵니다.
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("결과 카드 표시 컨테이너를 찾을 수 없습니다:", containerId);
        return; // 컨테이너가 없으면 함수 종료
    }

    // 2. 이전 검색 결과가 있다면 모두 지웁니다. (새로운 검색 결과를 표시하기 위함)
    container.innerHTML = "";

    // 3. 만약 검색된 시설이 없다면 "결과 없음" 메시지를 표시하고 종료할 수 있습니다.
    //    (이 로직은 fetchAndDisplayFacilities에서 이미 처리하므로 여기서는 생략 가능, 또는 중복으로 둘 수도 있음)
    if (!facilities || facilities.length === 0) {
        // displayNoResultsMessage(containerId); // 이미 호출되었다고 가정
        return;
    }

    // 4. facilities 배열의 각 시설 정보(fac)에 대해 반복 작업을 수행합니다.
    facilities.forEach(fac => {
        // 5. 각 시설 정보를 표시할 새로운 HTML 요소(카드)를 동적으로 생성합니다.
        //    여기서는 <div> 요소를 만들고 부트스트랩 카드 클래스를 적용합니다.
        const cardElement = document.createElement("div");
        cardElement.className = "card shadow border-0 rounded-4 mb-3"; // 부트스트랩 카드 스타일

        // 6. 카드의 내부 HTML을 구성합니다. fac 객체의 속성들을 사용합니다.
        //    (주의: fac.name, fac.address 등은 실제 서버 응답 데이터의 키 이름과 일치해야 합니다.)
        const homepageLink = fac.homepage ? `<a href="${fac.homepage.startsWith('http') ? fac.homepage : 'http://' + fac.homepage}" target="_blank" rel="noopener noreferrer">${fac.homepage}</a>` : '정보 없음';
        const telLink = fac.phone ? `<a href="tel:${fac.phone}">${fac.phone}</a>` : '정보 없음';

        cardElement.innerHTML = `
            <div class="card-body p-4">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-3 rounded-4">
                            <div class="text-primary fw-bolder mb-2">시설 이름: ${fac.name || '정보 없음'}</div>
                            ${fac.operating_time_weekday ? `<div class="small fw-bolder">운영 (평일): ${fac.operating_time_weekday}</div>` : ''}
                            ${fac.operating_time_weekend ? `<div class="small fw-bolder">운영 (주말): ${fac.operating_time_weekend}</div>` : ''}
                            ${fac.closed_days ? `<div class="small text-muted">휴무일: ${fac.closed_days}</div>` : ''}
                            ${fac.is_paid ? `<div class="small text-muted">유료 여부: ${fac.is_paid}</div>` : ''}
                            ${fac.type ? `<div class="small fw-bolder">분류: ${fac.type}</div>` : ''}
                        </div>
                    </div>
                    <div class="col-lg-8">
                        ${fac.address ? `<div class="mb-2"><strong>주소:</strong> ${fac.address}</div>` : ''}
                        ${fac.phone ? `<div class="mb-2"><strong>전화번호:</strong> ${telLink}</div>` : ''}
                        ${fac.homepage ? `<div class="mb-2"><strong>홈페이지:</strong> ${homepageLink}</div>` : ''}
                        ${fac.operating_entity ? `<div class="mb-2"><strong>운영 주체:</strong> ${fac.operating_entity}</div>` : ''}
                        ${(typeof fac.lat !== 'undefined' && fac.lat !== null) ? `<div class="mb-2 small text-muted">좌표: ${fac.lat.toFixed(5)}, ${fac.lng.toFixed(5)}</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        // 7. 완성된 카드 HTML 요소(cardElement)를 부모 컨테이너(container)의 자식으로 추가합니다.
        //    이렇게 하면 화면에 카드가 보이게 됩니다.
        container.appendChild(cardElement);
    });
}