async function requestFacilities(category) {
    // 주소 검색으로 얻은 위도, 경도 기준 사용
    const lat = currentLat;
    const lng = currentLng;

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

        const facilityList = await response.json(); // JSON -> 배열
        console.log("서버 응답:", facilityList);

        // 배열에 저장
        window.facilities = facilityList;

        // 지도 및 상세정보 업데이트
        displayFacilitiesOnMap(facilityList);       // 마커 표시
        displayFacilitiesBelowMap(facilityList);    // 상세정보 표시

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

function displayFacilitiesBelowMap(facilities) {
    const container = document.getElementById("facilityDetails");
    container.innerHTML = "";

    facilities.forEach(fac => {
        const el = document.createElement("div");
        el.className = "facility-card";
        el.innerHTML = `
            <strong>${fac.name}</strong><br>
            주소: ${fac.address}<br>
            전화번호: ${fac.phone || '없음'}<hr>
        `;
        container.appendChild(el);
    });
}