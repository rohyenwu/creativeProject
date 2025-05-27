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
        console.log("위도, 경도 : " + currentLat + " " + currentLng);
        console.log("카테고리id : " + currCategory)
        console.log("세부정보 : " + dropdownValue)
        const payload = {
            lat: parseFloat(currentLat),
            lon: parseFloat(currentLng),
            categoryID: currCategory,
            type: dropdownValue // 적절한 타입 문자열 입력 (예: 'hospital', 'restaurant' 등)
        };
        if (dropdownValue === "전체 선택"){
            payload.type = "all"
        }
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
        if (facilityList[0] === 1){
            displayFacilitiesOnMap(facilityList);
            displayFacilitiesBelowMap1(facilityList);
        }else if(facilityList[0] === 2){
            displayFacilitiesOnMap(facilityList);
            displayLeisureFacilitiesBelowMap2(facilityList);
        }else if(facilityList[0] === 3){
            displayFacilitiesOnMap(facilityList);
            displayOutingFacilitiesBelowMap3(facilityList);
        }


    } catch (error) {
        console.error("시설 데이터를 불러오지 못했습니다:", error);
    }
}

function displayFacilitiesOnMap(response) {

    // 지도 클릭 시 열려 있는 InfoWindow 닫기
    kakao.maps.event.addListener(map, "click", function () {
        if (openInfoWindow) {
            openInfoWindow.close();
            openInfoWindow = null;
        }
    });


    const categoryId = response[0];   // 1: hospital/public, 2: leisure, 3: outing
    const facilities = response[1];   // 실제 시설 배열

    // 기존 마커 제거
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    // 마커 이미지 설정
    const markerIcons = {
        1: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        2: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        3: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
    };

    const imageSrc = markerIcons[categoryId]; // 카테고리별 아이콘 선택
    const imageSize = new kakao.maps.Size(24, 35);
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    const ps = new kakao.maps.services.Places(); // 한 번만 생성
    let openInfoWindow = null; // 현재 열려 있는 InfoWindow

    facilities.forEach(fac => {
        if (!fac.latitude || !fac.longitude) return;

        const position = new kakao.maps.LatLng(fac.latitude, fac.longitude);
        const marker = new kakao.maps.Marker({ position, map, image: markerImage });

        const fid = fac.ID;
        marker.faciltyId = fid;

        kakao.maps.event.addListener(marker, "click", function () {
            // 기존 InfoWindow 닫기
            if (openInfoWindow) openInfoWindow.close();

            // 카카오 장소 검색
            ps.keywordSearch(fac.name, function (data, status) {
                if (status === kakao.maps.services.Status.OK && data.length > 0) {
                    const place = data[0]; // 첫 번째 결과 사용

                    const content = `
                   <div class="card p-3 mb-3 rounded-3 shadow-sm" style="font-size: 0.9rem;">
                      <div class="card-body"">
                        <h5 class="card-title mb-2 fw-bold">${place.place_name}</h5>
                        <p class="card-text mb-2">${place.road_address_name || place.address_name}</p>
                        <a href="https://place.map.kakao.com/${place.id}" target="_blank" class="btn btn-sm btn-primary">
                          카카오맵에서 보기
                        </a>
                      </div>
                    </div>
                `;
                    const infoWindow = new kakao.maps.InfoWindow({
                        content,
                        position: marker.getPosition()
                    });

                    infoWindow.open(map, marker);
                    openInfoWindow = infoWindow; // 현재 열린 창 저장
                } else {
                    // 기본 정보로 fallback
                    const infoWindow = new kakao.maps.InfoWindow({
                        content: `<div style="padding:10px;">${fac.name}<br>${fac.address}</div>`,
                        position: marker.getPosition()
                    });
                    infoWindow.open(map, marker);
                    openInfoWindow = infoWindow;
                }
            });

            //infowindow에 클릭이벤트 등록 - 해당 id를 가진 card로 스크롤 이동
            console.log('시설 ID:', fid); // 시설 ID 값 확인

            const cardElement = document.querySelector(`[id="${fid}"]`);
            if (cardElement) {
                console.log('카드 요소를 찾았습니다:', cardElement); // 찾은 요소 콘솔 출력

                cardElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                cardElement.classList.add("highlight"); // 강조를 위해 클래스 추가
                setTimeout(() => cardElement.classList.remove("highlight"), 2000); // 2초 뒤 클래스 제거
            }

        });
        window.markers.push(marker);
    });

}




function displayFacilitiesBelowMap1(facilityList) {
    const publicFacilities = facilityList[1]; // categoryID: 1
    const container = document.getElementById("publicFacilityCardsContainer");

    if (!Array.isArray(publicFacilities) || publicFacilities.length === 0) return;

    // 섹션 보이도록 설정
    document.getElementById("publicFacilityResultsSection").style.display = "block";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";

    // 기존 내용 비우기
    container.innerHTML = "";

    publicFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4" >
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
        // 카드 클릭 시 해당 마커로 이동하는 기능 구현
        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.faciltyId === facility.ID)

            if (targetMarker) {
                // 지도 중심을 해당 마커로 이동
                map.setCenter(targetMarker.getPosition());

                // 마커의 인포윈도우 열기
                const markerInfoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px; font-size:12px;">${facilityId}</div>`,
                });
                markerInfoWindow.open(map, targetMarker);
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });
}

function displayLeisureFacilitiesBelowMap2(facilityList) {
    const leisureFacilities = facilityList[1];
    const container = document.getElementById("outingCardsContainer");

    if (!Array.isArray(leisureFacilities) || leisureFacilities.length === 0) return;

    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "block";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";

    container.innerHTML = "";

    leisureFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-secondary fw-bolder mb-2">${facility.name}</div>
                            <div class="mb-2">
                            </div>
                        </div>
                    <div class="col-lg-8">
                        <div class="mb-2"><strong>주소:</strong> ${facility.address || '정보 없음'}</div>
                    </div>
                </div>
            </div>
        `;
        // 카드 클릭 시 해당 마커로 이동하는 기능 구현
        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.faciltyId === facility.ID)

            if (targetMarker) {
                // 지도 중심을 해당 마커로 이동
                map.setCenter(targetMarker.getPosition());

                // 마커의 인포윈도우 열기
                const markerInfoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px; font-size:12px;">${facilityId}</div>`,
                });
                markerInfoWindow.open(map, targetMarker);
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });
}

function displayOutingFacilitiesBelowMap3(facilityList) {
    const outingFacilities = facilityList[1];
    const container = document.getElementById("cultureFestivalCardsContainer");

    if (!Array.isArray(outingFacilities) || outingFacilities.length === 0) return;

    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("cultureFestivalResultsSection").style.display = "block";

    container.innerHTML = "";

    outingFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-warning fw-bolder mb-2">${facility.name}</div>
                            <div class="mb-2">
                                <div class="small fw-bolder">${facility.smallLeisure || '소분류 없음'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8"><div>${facility.address || '주소없음'}</div></div>
                </div>
            </div>
        `;
        // 카드 클릭 시 해당 마커로 이동하는 기능 구현
        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.faciltyId === facility.ID)

            if (targetMarker) {
                // 지도 중심을 해당 마커로 이동
                map.setCenter(targetMarker.getPosition());

                // 마커의 인포윈도우 열기
                const markerInfoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px; font-size:12px;">${facilityId}</div>`,
                });
                markerInfoWindow.open(map, targetMarker);
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });
}

function formatTime(seconds) {
    if (!seconds || seconds === 0) return "-";
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
