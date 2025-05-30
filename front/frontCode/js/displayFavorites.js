// 즐겨찾기 표시 기능

// API 엔드포인트 URL 설정
const API_BASE_URL = "http://localhost:8000";

//로그인 확인
document.addEventListener("DOMContentLoaded", () => {
    //const sessionId = getCookie("session_id"); // 쿠키에서 session_id 가져옴
    const sessionId = sessionStorage.getItem("session_id")
    const userName = sessionStorage.getItem("userName")

    if (!sessionId) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
    }
    const userNameElement = document.querySelector("h1.display-5 span.text-gradient");
    if (userNameElement) {
        userNameElement.textContent = `${userName} 님의 즐겨찾기`;
    }
    fetchFavorites(sessionId); // 즐겨찾기 데이터를 가져옴
});

// 쿠키 값 가져오기
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// 현재 로그인된 사용자 즐겨찾기 가져오기
async function fetchFavorites(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/favorite?session_id=${sessionId}`);
        if (!response.ok) {
            throw new Error("즐겨찾기 가져오기 실패");
        }
        const favorites = await response.json();
        console.log("즐겨찾기 목록" + favorites);
        renderFavorites(favorites); // 즐겨찾기 데이터를 렌더링
    } catch (error) {
        console.error(error);
        alert("즐겨찾기를 불러오는 데 실패했습니다.");
    }
}

// 즐겨찾기 HTML 렌더링
function renderFavorites(favorites) {
    console.log(favorites);
    const facilityContainer = document.getElementById("facility"); // 공공시설 섹션
    const outingContainer = document.getElementById("outing"); // 나들이 섹션
    const leisureContainer = document.getElementById("seniorCenter") // 복지시설 섹션
    // 화면 초기화
    facilityContainer.innerHTML = "";
    outingContainer.innerHTML = "";
    leisureContainer.innerHTML = "";

    // 즐겨찾기 항목 렌더링
    favorites.forEach((favorite) => {
        // 카테고리에 따라 라우팅 -- 이부분 백엔드에서도 3가지 리스트
        if (favorite.category === 0) {
            const card = document.createElement("div");
            card.className = "card shadow border-0 rounded-4 mb-5";

            card.innerHTML = `
            <div class="card-body p-5" id="${favorite.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4" >
                            <div class="text-primary fw-bolder mb-2">${favorite.name}</div>
                            <div class="small fw-bolder">유형: ${favorite.type || '정보 없음'}</div>
                            <div class="small text-muted">휴관일: ${favorite.closedDays || '없음'}</div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="mb-2"><strong>주소:</strong> ${favorite.address || '정보 없음'}</div>
                        <div class="mb-2"><strong>전화번호:</strong> ${favorite.call || '없음'}</div>
                        <div class="mb-2"><strong>운영시간(평일):</strong> ${formatTime(favorite.weekOpenTime)} ~ ${formatTime(favorite.weekClosedTime)}</div>
                        <div class="mb-2"><strong>홈페이지:</strong> ${favorite.homepageAddress ? `<a href="${favorite.homepageAddress}" target="_blank">${favorite.homepageAddress}</a>` : '없음'}</div>
                        <div><strong>유료 여부:</strong> ${favorite.isPayed === 1 ? "유료" : "무료"}</div>
                    </div>
                </div>
            </div>
        `;
            facilityContainer.innerHTML += favoriteCard;
        } else if (favorite.category === 1) {
            const card = document.createElement("div");
            card.className = "card shadow border-0 rounded-4 mb-5";

            card.innerHTML = `
            <div class="card-body p-5" id="${favorite.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-secondary fw-bolder mb-2">${favorite.name}</div>
                            <div class="mb-2">
                            </div>
                        </div>
                    <div class="col-lg-8">
                        <div class="mb-2"><strong>주소:</strong> ${favorite.address || '정보 없음'}</div>
                    </div>
                </div>
            </div>
        `;
            outingContainer.innerHTML += favoriteCard;
        } else if (favorite.category === 2) {
            const card = document.createElement("div");
            card.className = "card shadow border-0 rounded-4 mb-5";

            card.innerHTML = `
            <div class="card-body p-5" id="${favorite.ID}">
                <div class="row align-items-center gx-5">
                    <div class="col text-center text-lg-start mb-4 mb-lg-0">
                        <div class="bg-light p-4 rounded-4">
                            <div class="text-warning fw-bolder mb-2">${favorite.name}</div>
                            <div class="mb-2">
                                <div class="small fw-bolder">${favorite.smallLeisure || '소분류 없음'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8"><div>${favorite.address || '주소없음'}</div></div>
                </div>
            </div>
        `;
            leisureContainer.innerHTML += favoriteCard;
        }
    });
}