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
        renderFavorites(favorites); // 즐겨찾기 데이터를 렌더링
    } catch (error) {
        console.error(error);
        alert("즐겨찾기를 불러오는 데 실패했습니다.");
    }
}

// 즐겨찾기 HTML 렌더링
function renderFavorites(favorites) {
    const facilityContainer = document.getElementById("facility"); // 공공시설 섹션
    const outingContainer = document.getElementById("outing"); // 나들이 섹션

    // 화면 초기화
    facilityContainer.innerHTML = "";
    outingContainer.innerHTML = "";

    // 즐겨찾기 항목 렌더링
    favorites.forEach((favorite) => {
        const favoriteCard = `
            <div class="card shadow border-0 rounded-4 mb-5">
                <div class="card-body p-5">
                    <div class="row align-items-center gx-5">
                        <div class="col text-center text-lg-start">
                            <h5 class="fw-bold">${favorite.name}</h5>
                            <p>${favorite.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 카테고리에 따라 라우팅 -- 이부분 백엔드에서도 3가지 리스트로 보내줘야 할듯
        if (favorite.category === 1) {
            facilityContainer.innerHTML += favoriteCard;
        } else if (favorite.category === 2) {
            outingContainer.innerHTML += favoriteCard;
        }
    });
}