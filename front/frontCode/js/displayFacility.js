window.addEventListener('pageshow', function(event) {
    // 1. sessionStorage에 새로고침 신호가 있는지 확인합니다.
    if (sessionStorage.getItem('mainPageNeedsRefresh') === 'true') {

        console.log("즐겨찾기 변경 감지. 메인 페이지를 새로고침합니다.");

        // 2. 신호를 사용했으므로 즉시 삭제하여 반복 새로고침을 방지합니다.
        sessionStorage.removeItem('mainPageNeedsRefresh');

        // 3. 페이지를 새로고침합니다.
        window.location.reload();
    }
});

let favoriteFacilityIds = new Set();

document.addEventListener("DOMContentLoaded", () => {
    const sessionId = sessionStorage.getItem("session_id");

    if(sessionId){
        fetchFavorites(sessionId);
    }else {
        alert("비회원으로 접속하셨습니다.");
    }
});

const API_BASE_URL = "http://127.0.0.1:8000";

async function fetchFavorites(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/favorite?session_id=${sessionId}`);
        if (!response.ok) {
            throw new Error("즐겨찾기 가져오기 실패");
        }
        const favoritesByCategory = await response.json();

        const allFavorites = favoritesByCategory.flat();

        favoriteFacilityIds.clear();
        if (Array.isArray(allFavorites)) {
            allFavorites.forEach(fav => {
                if (fav && fav.ID !== undefined) {
                    favoriteFacilityIds.add(fav.ID.toString());
                }
            });
        }
        console.log("현재 사용자의 즐겨찾기 ID 목록:", favoriteFacilityIds);
    } catch (error) {
        console.error(error);
    }
}

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

        const categoryID = facilityList[0];

        if (categoryID >= 1 && categoryID <= 4) {
            document.getElementById('totalFacilityResultsSection').style.display = "none";
            document.getElementById("publicFacilityResultsSection").style.display = "none";
            document.getElementById("cultureFestivalResultsSection").style.display = "none";
            document.getElementById("outingResultsSection").style.display = "none";
            document.getElementById("hospitalResultSection").style.display = "none";
        }

        window.facilities = facilityList;
        if (facilityList[0] === 1) {
            displayFacilitiesOnMap(facilityList);
            displayFacilitiesBelowMap1(facilityList, 1);
        } else if (facilityList[0] === 2) {
            displayFacilitiesOnMap(facilityList);
            displayLeisureFacilitiesBelowMap2(facilityList, 2);
        } else if (facilityList[0] === 3) {
            displayFacilitiesOnMap(facilityList);
            displayOutingFacilitiesBelowMap3(facilityList, 3);
        } else if (facilityList[0] === 4) {
            displayFacilitiesOnMap(facilityList);
            displayHospitalFacilitiesBelowMap(facilityList, 4);
        } else if (facilityList[0] === 0) {
            displayTotalFacilitiesOnMap(facilityList)
            displayTotalFacilitesBlowMap(facilityList);
        }

    } catch (error) {
        console.error("시설 데이터를 불러오지 못했습니다:", error);
    }
}

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
            if (!fac || !fac.latitude || !fac.longitude) return;

            const position = new kakao.maps.LatLng(fac.latitude, fac.longitude);
            const marker = new kakao.maps.Marker({ position, map, image: markerImage });

            const fid = fac.ID;
            marker.facilityId = fid;  // ✅ 오타 고침

            kakao.maps.event.addListener(marker, "click", function () {
                if (window.openInfoWindowTotal) {
                    window.openInfoWindowTotal.close();
                }

                const content = `
                    <div class="card p-3 mb-3 rounded-3" style="font-size: 0.8rem; max-width: 280px;">
                        <div class="card-body p-2">
                            <h5 class="card-title mb-2 fw-bold">${fac.name}</h5>
                            <a href="https://map.kakao.com/link/search/${encodeURIComponent(fac.name)}" target="_blank" class="btn btn-sm btn-primary">카카오맵에서 검색</a>
                        </div>
                    </div>`;

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
                    cardElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                    cardElement.classList.add("highlight");
                    setTimeout(() => cardElement.classList.remove("highlight"), 2000);
                }
            });

            window.markers.push(marker);
        });
    });
}


function displayFacilitiesOnMap(response) {
    kakao.maps.event.addListener(map, "click", function () {
        if (openInfoWindow) {
            openInfoWindow.close();
            openInfoWindow = null;
        }
    });

    const categoryId = response[0];
    const facilities = response[1];

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

    const imageSrc = markerIcons[categoryId];
    const imageSize = new kakao.maps.Size(24, 35);
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    let openInfoWindow = null;

    facilities.forEach(fac => {
        if (!fac.latitude || !fac.longitude) return;

        const position = new kakao.maps.LatLng(fac.latitude, fac.longitude);
        const marker = new kakao.maps.Marker({ position, map, image: markerImage });

        const fid = fac.ID;
        marker.facilityId = fid;  // ✅ 오타 고침

        kakao.maps.event.addListener(marker, "click", function () {
            if (openInfoWindow) openInfoWindow.close();

            const content = `
                <div class="card p-3 mb-3 rounded-3" style="font-size: 0.8rem; max-width: 280px;">
                    <div class="card-body p-2">
                        <h5 class="card-title mb-2 fw-bold">${fac.name}</h5>
                        <a href="https://map.kakao.com/link/search/${encodeURIComponent(fac.name)}" target="_blank" class="btn btn-sm btn-primary">카카오맵에서 검색</a>
                    </div>
                </div>`;

            const infoWindow = new kakao.maps.InfoWindow({
                content: content,
                position: marker.getPosition(),
            });

            infoWindow.open(map, marker);
            openInfoWindow = infoWindow;

            console.log('시설 ID:', fid);
            const cardElement = document.querySelector(`[id="${fid}"]`);
            if (cardElement) {
                console.log('카드 요소를 찾았습니다:', cardElement);
                cardElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                cardElement.classList.add("highlight");
                setTimeout(() => cardElement.classList.remove("highlight"), 2000);
            }
        });

        window.markers.push(marker);
    });
}


/**
 * @param {string} facilityID - 시설 ID
 * @param {HTMLElement} buttonElement - 클릭된 버튼 요소 (this)
 */

async function addFavorite(facilityID, categoryID, buttonElement) {
    const session_id = sessionStorage.getItem("session_id");
    if (!session_id) {
        alert("로그인이 필요합니다.");
        return;
    }

    // [개선점] categoryID가 유효한지 확인하는 로직 추가
    if (categoryID === undefined || categoryID === null) {
        console.error("즐겨찾기 추가 실패: categoryID가 없습니다.");
        alert("시설의 카테고리 정보가 없어 즐겨찾기를 추가할 수 없습니다.");
        return;
    }

    try {
        // [개선점 1] 하드코딩된 URL을 API_BASE_URL 상수로 교체
        const response = await fetch(`${API_BASE_URL}/addFavorite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                session_id: session_id,
                facilityID: facilityID,
                categoryID: categoryID
            })
        });

        if (!response.ok) {
            // 서버에서 보낸 에러 메시지를 우선적으로 사용
            const err = await response.json().catch(() => ({ detail: "서버 응답을 JSON으로 파싱할 수 없습니다." }));
            throw new Error(err.detail || "즐겨찾기 추가 요청 실패");
        }

        const result = await response.json();
        console.log("즐겨찾기 추가 성공:", result.message);

        // --- UI 업데이트 로직 ---

        // 1. 전역 즐겨찾기 Set에 현재 시설 ID 추가
        favoriteFacilityIds.add(String(facilityID));

        // 2. 버튼 아이콘을 채워진 별로 변경
        const icon = buttonElement.querySelector('i');
        if (icon) {
            icon.classList.remove('bi-star');
            icon.classList.add('bi-star-fill');
        }

        // 3. 버튼 색상을 노란색으로 변경 (또는 클래스로 제어)
        buttonElement.style.color = '#ffc107';

        // 4. 버튼의 title 속성 변경 (툴팁)
        buttonElement.title = '즐겨찾기 제거';

        // 5. [개선점 2] 버튼의 onclick 이벤트를 'removeFavorite'으로 변경 (categoryID 포함)
        buttonElement.setAttribute('onclick', `removeFavorite('${facilityID}', '${categoryID}', this)`);

    } catch (error) {
        console.error("즐겨찾기 추가 중 오류:", error);
        // 사용자에게 받은 에러 메시지를 그대로 보여주는 것이 더 직관적입니다.
        alert(error.message || "즐겨찾기 추가 중 알 수 없는 오류가 발생했습니다.");
    }
}

// displayFacility.js

// 이 파일 어딘가에 API_BASE_URL이 선언되어 있어야 합니다.
// const API_BASE_URL = "http://127.0.0.1:8000";

async function removeFavorite(facilityID, categoryID, buttonElement) {
    const session_id = sessionStorage.getItem("session_id");
    if (!session_id) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/deleteFavorite`, {
            // [수정 3] FastAPI가 @router.post로 정의되어 있으므로 'POST' 메소드를 사용합니다.
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // FastAPI의 DeleteFavoriteRequest가 받는 데이터에 맞게 body를 구성합니다.
            body: JSON.stringify({
                session_id: session_id,
                facilityID: facilityID,
                // 참고: 현재 백엔드에서는 categoryID를 받지 않으므로 보내지 않습니다.
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "서버 응답 파싱 실패" }));
            throw new Error(err.detail || "즐겨찾기 제거 요청 실패");
        }

        const result = await response.json();
        console.log("즐겨찾기 제거 성공:", result.message);

        // --- UI 업데이트 로직 ---

        // 1. 전역 즐겨찾기 Set에서 현재 시설 ID 제거
        favoriteFacilityIds.delete(String(facilityID));

        // 2. 버튼 아이콘을 빈 별로 변경
        const icon = buttonElement.querySelector('i');
        if (icon) {
            icon.classList.remove('bi-star-fill');
            icon.classList.add('bi-star');
        }

        // 3. 버튼 색상을 원래 색상으로 변경 (예: 회색)
        buttonElement.style.color = '#6c757d';

        // 4. 버튼의 title 속성 변경
        buttonElement.title = '즐겨찾기 추가';

        // 5. [중요] 버튼의 onclick 이벤트를 다시 'addFavorite'으로 변경
        // categoryID가 있어야 즐겨찾기를 다시 추가할 수 있으므로, 매개변수로 받아온 값을 그대로 사용합니다.
        buttonElement.setAttribute('onclick', `addFavorite('${facilityID}', '${categoryID}', this)`);

    } catch (error) {
        console.error("즐겨찾기 제거 중 오류:", error);
        alert(error.message || "즐겨찾기 제거 중 오류가 발생했습니다.");
    }
}

/**
 * @param {Array} facilityList - 서버에서 받은 전체 시설 목록 데이터
 */
function displayTotalFacilitesBlowMap(facilityList) {
    // 1. 시작 전 모든 결과 섹션을 숨겨서 초기화합니다.
    document.getElementById('publicFacilityResultsSection').style.display = "none";
    document.getElementById("cultureFestivalResultsSection").style.display = "none";
    document.getElementById("outingResultsSection").style.display = "none";
    document.getElementById("hospitalResultSection").style.display = "none";
    // ※ 'totalFacilityResultsSection'은 전체를 감싸는 wrapper div라면 그대로 두거나,
    // 이 섹션도 독립적인 UI를 가진다면 여기서 보이게 처리합니다.
    document.getElementById('totalFacilityResultsSection').style.display = "block"; // Wrapper를 보여줌

    const categoryFacilityPairs = facilityList[1];

    // 검색 결과가 하나도 없는 경우
    if (!Array.isArray(categoryFacilityPairs) || categoryFacilityPairs.length === 0) {
        // 모든 섹션이 숨겨진 상태이므로, '결과 없음' 메시지를 표시할 곳이 필요하다면
        // totalFacilityCardsContainer에 표시합니다.
        const totalContainer = document.getElementById("totalFacilityCardsContainer");
        if (totalContainer) {
            totalContainer.innerHTML = '<div class="text-center p-5 text-muted">검색된 시설이 없습니다.</div>';
        }
        return;
    }

    const totalContainer = document.getElementById("totalFacilityCardsContainer");
    if(totalContainer) totalContainer.innerHTML = "";


    categoryFacilityPairs.forEach(categoryData => {
        const categoryId = categoryData[0];
        const facilities = categoryData[1];

        // 각 display 함수가 받는 데이터 형식([id, [시설배열]])에 맞게 데이터를 "재포장"합니다.
        const packagedData = [categoryId, facilities];

        switch (categoryId) {
            case 1:
                displayFacilitiesBelowMap1(packagedData, 1);
                break;
            case 2:
                // 함수 이름이 'displayLeisureFacilitiesBelowMap2'라고 가정
                displayLeisureFacilitiesBelowMap2(packagedData, 2);
                break;
            case 3:
                // 함수 이름이 'displayOutingFacilitiesBelowMap3'라고 가정
                displayOutingFacilitiesBelowMap3(packagedData, 3);
                break;
            case 4:
                // 함수 이름이 'displayHospitalFacilitiesBelowMap'라고 가정
                displayHospitalFacilitiesBelowMap(packagedData, 4);
                break;
        }
    });
}


function displayFacilitiesBelowMap1(facilityList, categoryID) {
    const publicFacilities = facilityList[1];
    const container = document.getElementById("publicFacilityCardsContainer");

    if (!Array.isArray(publicFacilities) || publicFacilities.length === 0) return;

    document.getElementById("publicFacilityResultsSection").style.display = "block";
    container.innerHTML = "";

    publicFacilities.forEach(facility => {
        const isFavorite = favoriteFacilityIds.has(String(facility.ID));
        const starIcon = isFavorite ? 'bi-star-fill' : 'bi-star';
        const starColor = isFavorite ? '#ffc107' : '#6c757d';
        const buttonTitle = isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가';
        const onClickAction = isFavorite
            ? `removeFavorite('${facility.ID}', '${categoryID}', this)`
            : `addFavorite('${facility.ID}', '${categoryID}', this)`;

        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";
        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <button
                    data-category-id="${categoryID}" 
                    class="position-absolute top-0 end-0 m-3 btn border-0" 
                    onclick="${onClickAction}"
                    title="${buttonTitle}"
                    style="font-size: 1rem; line-height: 1; color: ${starColor};">
                    <i class="bi ${starIcon}"></i>
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

        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.facilityId === facility.ID); // ✅ 수정됨

            if (targetMarker) {
                map.setCenter(targetMarker.getPosition());
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facility.ID}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });

        container.appendChild(card);
    });
}


function displayLeisureFacilitiesBelowMap2(facilityList, categoryID) {
    const leisureFacilities = facilityList[1];
    const container = document.getElementById("outingCardsContainer");

    if (!Array.isArray(leisureFacilities) || leisureFacilities.length === 0) return;

    document.getElementById("outingResultsSection").style.display = "block";
    container.innerHTML = "";

    leisureFacilities.forEach(facility => {
        const isFavorite = favoriteFacilityIds.has(String(facility.ID));
        const starIcon = isFavorite ? 'bi-star-fill' : 'bi-star';
        const starColor = isFavorite ? '#ffc107' : '#6c757d';
        const buttonTitle = isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가';
        const onClickAction = isFavorite
            ? `removeFavorite('${facility.ID}', '${categoryID}', this)`
            : `addFavorite('${facility.ID}', '${categoryID}', this)`;

        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <button
                    class="position-absolute top-0 end-0 m-3 btn border-0" 
                    data-category-id="${categoryID}" 
                    onclick="${onClickAction}"
                    title="${buttonTitle}"
                    style="font-size: 1rem; line-height: 1; color: ${starColor};">
                    <i class="bi ${starIcon}"></i>
                </button>
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-secondary fw-bolder mb-2">${facility.name}</div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="mb-2"><strong>주소:</strong> ${facility.address || '정보 없음'}</div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.facilityId === facility.ID); // 고침: facilityId
            if (targetMarker) {
                map.setCenter(targetMarker.getPosition());
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facility.ID}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });

        container.appendChild(card);
    });
}


function displayOutingFacilitiesBelowMap3(facilityList, categoryID) {
    const outingFacilities = facilityList[1];
    const container = document.getElementById("cultureFestivalCardsContainer");

    if (!Array.isArray(outingFacilities) || outingFacilities.length === 0) return;

    document.getElementById("cultureFestivalResultsSection").style.display = "block";
    container.innerHTML = "";

    outingFacilities.forEach(facility => {
        const isFavorite = favoriteFacilityIds.has(String(facility.ID));
        const starIcon = isFavorite ? 'bi-star-fill' : 'bi-star';
        const starColor = isFavorite ? '#ffc107' : '#6c757d';
        const buttonTitle = isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가';
        const onClickAction = isFavorite
            ? `removeFavorite('${facility.ID}', '${categoryID}', this)`
            : `addFavorite('${facility.ID}', '${categoryID}', this)`;

        const card = document.createElement("div");
        card.className = "card shadow border-0 rounded-4 mb-5";

        card.innerHTML = `
            <div class="card-body p-5" id="${facility.ID}">
                <button
                    class="position-absolute top-0 end-0 m-3 btn border-0" 
                    data-category-id="${categoryID}" 
                    onclick="${onClickAction}"
                    title="${buttonTitle}"
                    style="font-size: 1rem; line-height: 1; color: ${starColor};">
                    <i class="bi ${starIcon}"></i>
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
                    <div class="col-lg-8">
                        <div>${facility.address || '주소 없음'}</div>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            const targetMarker = window.markers.find(marker => marker.facilityId === facility.ID); // 고침: facilityId
            if (targetMarker) {
                map.setCenter(targetMarker.getPosition());
                kakao.maps.event.trigger(targetMarker, 'click');
            } else {
                console.error(`시설 ID ${facility.ID}에 해당하는 마커를 찾을 수 없습니다.`);
            }
        });

        container.appendChild(card);
    });
}


function displayHospitalFacilitiesBelowMap(hospitalFacilityList) {
    const hospitals = hospitalFacilityList[1];
    const container = document.getElementById("hospitalResultContainer");

    if (!Array.isArray(hospitals) || hospitals.length === 0) return;

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
