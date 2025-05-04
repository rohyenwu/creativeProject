async function requestFacilities(category) {
    // 주소 검색으로 얻은 위도, 경도 기준 사용
    const lat = currentLat;
    const lng = currentLng;

    try {
        // category, lat, lng 변수는 이미 정의되어 있다고 가정
        const payload = {
            lat: lat,
            lon: lng,
            categoryID: 3,
            type: "복지관" // 적절한 타입 문자열 입력 (예: 'hospital', 'restaurant' 등)
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