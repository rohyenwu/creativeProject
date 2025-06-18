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
        if (dropdownValue === "전체 선택") {
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
        if (facilityList[0] === 1) {
            displayFacilitiesOnMap(facilityList);
            displayFacilitiesBelowMap1(facilityList);
        } else if (facilityList[0] === 2) {
            displayFacilitiesOnMap(facilityList);
            displayLeisureFacilitiesBelowMap2(facilityList);
        } else if (facilityList[0] === 3) {
            displayFacilitiesOnMap(facilityList);
            displayOutingFacilitiesBelowMap3(facilityList);
        } else if (facilityList[0] === 4) {
            displayFacilitiesOnMap(facilityList);
            displayHospitalFacilitiesBelowMap(facilityList);
        } else if (facilityList[0] === 0) {
            displayTotalFacilitiesOnMap(facilityList)
            displayTotalFacilitesBlowMap(facilityList);
        }


    } catch (error) {
        console.error("시설 데이터를 불러오지 못했습니다:", error);
    }
}

/**
 * 여러 카테고리의 시설들을 각각의 카테고리 아이콘으로 지도에 표시합니다.
 * "total" 요청과 같이 여러 카테고리 데이터가 배열로 올 때 사용됩니다.
 * 서버 응답 형식 예시: [0, [[1, [facility1, facility2]], [3, [facility3, facility4]]]]
 * 여기서 첫 번째 0은 식별자, 두 번째 요소가 실제 [카테고리ID, 시설배열] 쌍들의 배열입니다.
 *
 * @param {Array} serverResponse
 *
 */
function displayTotalFacilitiesOnMap(serverResponse) {
    const categoryFacilityPairs = serverResponse[1];

    if (!Array.isArray(categoryFacilityPairs) || categoryFacilityPairs.length === 0) {
        console.warn("표시할 시설 데이터가 없거나 형식이 올바르지 않습니다.", categoryFacilityPairs);
        if (window.markers) {
            window.markers.forEach(marker => marker.setMap(null));
            window.markers = [];
        }
        return;
    }

    if (!window.mapClickListenerAttachedTotal) {
        kakao.maps.event.addListener(map, "click", function () {
            if (window.openInfoWindowTotal) {
                window.openInfoWindowTotal.close();
                window.openInfoWindowTotal = null;
            }
        });
        window.mapClickListenerAttachedTotal = true;
    }

    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    const markerIcons = {
        0: 'assets/total.png',
        1: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        2: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        3: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        4: 'assets/hospital.png',
    };
    const imageSize = new kakao.maps.Size(24, 35);

    const ps = new kakao.maps.services.Places();
    window.openInfoWindowTotal = null;

    categoryFacilityPairs.forEach(categoryData => {
        if (!Array.isArray(categoryData) || categoryData.length !== 2) {
            console.warn("잘못된 카테고리 데이터 형식:", categoryData);
            return;
        }

        const categoryId = categoryData[0];
        const facilities = categoryData[1];

        if (!facilities || !Array.isArray(facilities) || facilities.length === 0) {
            return;
        }

        const imageSrc = markerIcons[categoryId] || markerIcons[0];
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        facilities.forEach(fac => {
            if (!fac || !fac.latitude || !fac.longitude) {
                return;
            }

            const position = new kakao.maps.LatLng(fac.latitude, fac.longitude);
            const marker = new kakao.maps.Marker({
                position,
                map,
                image: markerImage
            });

            const fid = fac.ID;
            marker.facilityId = fid;

            kakao.maps.event.addListener(marker, "click", function () {
                if (window.openInfoWindowTotal) {
                    window.openInfoWindowTotal.close();
                }

                const content = `
                   <div class="card p-3 mb-3 rounded-3" style="font-size: 0.8rem; max-width: 280px;">
                      <div class="card-body p-2">
                        <h5 class="card-title mb-2 fw-bold" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.5rem !important;">${fac.name}</h5>
                        <a href="https://map.kakao.com/link/search/${encodeURIComponent(fac.name)}" target="_blank" class="btn btn-sm btn-primary" style="white-space: nowrap; display: inline-block;">
                          카카오맵에서 검색
                        </a>
                      </div>
                    </div>
                `;

                const infoWindow = new kakao.maps.InfoWindow({
                    content: content,
                    position: marker.getPosition(),
                });

                infoWindow.open(map, marker);
                window.openInfoWindowTotal = infoWindow;

                console.log('시설 ID:', fid);
                const cardElement = document.querySelector(`[id="${fid}"]`);
                if (cardElement) {
                    console.log('카드 요소를 찾았습니다:', cardElement);
                    cardElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                    cardElement.classList.add("highlight");
                    setTimeout(() => cardElement.classList.remove("highlight"), 2000);
                }
            });
            window.markers.push(marker);
        });
    });
}

function displayFacilitiesOnMap(response) {
    // 지도 클릭 시 열려 있는 InfoWindow 닫기
    kakao.maps.event.addListener(map, "click", function () {
        if (openInfoWindow) {
            openInfoWindow.close();
            openInfoWindow = null;
        }
    });
    const categoryId = response[0];   // 1: public, 2: leisure, 3: outing, 4:hospital
    const facilities = response[1];   // 실제 시설 배열

    // 기존 마커 제거
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    // 마커 이미지 설정
    const markerIcons = {
        0: 'assets/total.png',
        1: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        2: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        3: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        4: 'assets/hospital.png',
    };

    const imageSrc = markerIcons[categoryId]; // 카테고리별 아이콘 선택
    const imageSize = new kakao.maps.Size(24, 35);
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    const ps = new kakao.maps.services.Places(); // 한 번만 생성
    let openInfoWindow = null; // 현재 열려 있는 InfoWindow

    facilities.forEach(fac => {
        if (!fac.latitude || !fac.longitude) return;

        const position = new kakao.maps.LatLng(fac.latitude, fac.longitude);
        const marker = new kakao.maps.Marker({position, map, image: markerImage});

        const fid = fac.ID;
        marker.faciltyId = fid;

        kakao.maps.event.addListener(marker, "click", function () {
            // 기존 InfoWindow 닫기
            if (openInfoWindow) openInfoWindow.close();

            //InfoWindow 구현(기존 정보 사용), kakaoMap Search X
            const content = `
               <div class="card p-3 mb-3 rounded-3" style="font-size: 0.8rem; max-width: 280px;">
                  <div class="card-body p-2">
                    <h5 class="card-title mb-2 fw-bold" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.5rem !important;">${fac.name}</h5>
                    <a href="https://map.kakao.com/link/search/${encodeURIComponent(fac.name)}" target="_blank" class="btn btn-sm btn-primary" style="white-space: nowrap; display: inline-block;">
                      카카오맵에서 검색
                    </a>
                  </div>
                </div>
            `;

            const infoWindow = new kakao.maps.InfoWindow({
                content: content,
                position: marker.getPosition(), // 마커의 위치를 사용합니다.
            });

            infoWindow.open(map, marker);
            openInfoWindow = infoWindow; // 현재 열린 인포윈도우를 저장합니다.

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
// 즐겨찾기 추가
async function addFavorite(facilityID, categoryID) {
    //const session_id = getCookie("session_id");
    console.log(facilityID);
    console.log(typeof (facilityID));
    const session_id = sessionStorage.getItem("session_id");
    if (!session_id) {
        alert("로그인이 필요합니다.");
        return;
    }
    console.log("현재정보", session_id, facilityID, categoryID);

    try {
        const response = await fetch("http://localhost:8000/addFavorite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // "Authorization": session_id
            },
            body: JSON.stringify({
                session_id: session_id,
                facilityID: facilityID,
                categoryID: categoryID
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "요청 실패");
        }

        const result = await response.json();
        alert("즐겨찾기 추가 완료")
        console.log("즐겨찾기 추가:", result);

    } catch (error) {
        console.error("즐겨찾기 처리 중 오류:", error, error.message);
        alert("즐겨찾기 처리 중 오류가 발생했습니다.");
    }
}

function displayTotalFacilitesBlowMap(facilityList) {
    const publicFacilities = facilityList[1][0][1];
    const leisureFacilities = facilityList[1][1][1];
    const outingFacilities = facilityList[1][2][1];
    const container = document.getElementById("totalFacilityCardsContainer");

    document.getElementById('totalFacilityResultsSection').style.display = 'block';
    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("hospitalResultSection").style.display = "none";

    container.innerHTML = "";

    publicFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <button
                    class="position-absolute top-0 end-0 m-3 btn border-0" 
                    onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                    title="즐겨찾기 추가"
                    style="font-size: 1rem; line-height: 1; color: #6c757d;">
                    <i class="bi bi-star"></i>
                </button>
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
            console.log(targetMarker);
            if (targetMarker) {
                // 지도 중심을 해당 마커로 이동
                map.setCenter(targetMarker.getPosition());

                // 마커의 인포윈도우 열기
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });

    leisureFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
            <button
                    class="position-absolute top-0 end-0 m-3 btn btn-light border-0" 
                    onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                    title="즐겨찾기 추가/제거"
                    style="font-size: 1.5rem; line-height: 1;">
                    즐겨찾기 추가
                </button>
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
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });

    outingFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
            <button
                    class="position-absolute top-0 end-0 m-3 btn btn-light border-0" 
                    onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                    title="즐겨찾기 추가/제거"
                    style="font-size: 1.5rem; line-height: 1;">
                    즐겨찾기 추가
                </button>
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
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });

}


function displayFacilitiesBelowMap1(facilityList) {
    const publicFacilities = facilityList[1]; // categoryID: 1
    const container = document.getElementById("publicFacilityCardsContainer");

    if (!Array.isArray(publicFacilities) || publicFacilities.length === 0) return;

    // 섹션 보이도록 설정
    document.getElementById('totalFacilityResultsSection').style.display = 'none';
    document.getElementById("publicFacilityResultsSection").style.display = "block";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("hospitalResultSection").style.display = "none";

    // 기존 내용 비우기
    container.innerHTML = "";

    publicFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
           <button
                    class="position-absolute top-0 end-0 m-3 btn border-0" 
                    onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                    title="즐겨찾기 추가"
                    style="font-size: 1rem; line-height: 1; color: #6c757d;">
                    <i class="bi bi-star"></i>
                </button>
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
                kakao.maps.event.trigger(targetMarker, 'click');
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

    document.getElementById('totalFacilityResultsSection').style.display = 'none';
    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "block";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("hospitalResultSection").style.display = "none";

    container.innerHTML = "";

    leisureFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
           <button
                class="position-absolute top-0 end-0 m-3 btn border-0" 
                onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                title="즐겨찾기 추가"
                style="font-size: 1rem; line-height: 1; color: #6c757d;">
                <i class="bi bi-star"></i>
            </button>
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
                kakao.maps.event.trigger(targetMarker, 'click');
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

    document.getElementById('totalFacilityResultsSection').style.display = 'none';
    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("cultureFestivalResultsSection").style.display = "block";
    document.getElementById("hospitalResultSection").style.display = "none";

    container.innerHTML = "";

    outingFacilities.forEach(facility => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
           <button
                class="position-absolute top-0 end-0 m-3 btn border-0" 
                onclick="addFavorite('${facility.ID}', ${facility.category_categoryID})"
                title="즐겨찾기 추가"
                style="font-size: 1rem; line-height: 1; color: #6c757d;">
                <i class="bi bi-star"></i>
            </button>
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
            console.log(targetMarker);
            if (targetMarker) {
                // 지도 중심을 해당 마커로 이동
                map.setCenter(targetMarker.getPosition());

                // 마커의 인포윈도우 열기
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facilityId}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });
        container.appendChild(card);
    });
}

function displayHospitalFacilitiesBelowMap(hospitalFacilityList) {
    const hospitals = hospitalFacilityList[1];
    const container = document.getElementById("hospitalResultContainer");

    if (!Array.isArray(hospitals) || hospitals.length === 0) return;

    document.getElementById('totalFacilityResultsSection').style.display = 'none';
    document.getElementById("publicFacilityResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("hospitalResultSection").style.display = "block";

    container.innerHTML = "";

    hospitals.forEach(hospital => {
        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        const hospitalName = hospital.name || '이름 정보 없음';
        const medicalDepartments = hospital.medicalDepartment || '진료과목 정보 없음';
        const address = hospital.address || '주소 정보 없음';
        const hospitalID = hospital.ID;

        card.innerHTML = `
            <div class="card-body p-5" id="${hospitalID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-danger fw-bolder mb-2">${hospitalName}</div>
                            <div class="mb-2">
                            </div>                    
                        </div>
                    </div>
                     ${hospital.type ? `<div class="text-muted">${hospital.type}</div>` : ''}
                    <div class="col-lg-8">
                    <div>${address}</div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            const targetMarker = window.markers && window.markers.find(marker => marker.facilityId === hospitalID);

            if (targetMarker && typeof map !== 'undefined' && typeof kakao !== 'undefined') {
                map.setCenter(targetMarker.getPosition());

                const markerInfoWindow = new kakao.maps.InfoWindow({
                    content: `<div style="padding:5px; font-size:12px; white-space: nowrap;">${hospitalName}</div>`,
                });
                markerInfoWindow.open(map, targetMarker);
            } else {
                if (!targetMarker) {
                    console.error(`병원 ID ${hospitalID} (${hospitalName})에 해당하는 마커를 찾을 수 없습니다. window.markers를 확인하세요.`);
                }
                if (typeof map === 'undefined') {
                    console.error("Kakao Map object 'map' is not defined.");
                }
                if (typeof kakao === 'undefined') {
                    console.error("Kakao Maps SDK 'kakao' is not defined.");
                }
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
