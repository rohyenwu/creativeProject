const API_BASE_URL = "http://localhost:8000";

// 로그인 확인
document.addEventListener("DOMContentLoaded", () => {
    const sessionId = sessionStorage.getItem("session_id");
    const userName = sessionStorage.getItem("userName");

    if (!sessionId) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
    }

    const userNameElement = document.querySelector("h1.display-5 span.text-gradient");
    if (userNameElement) {
        userNameElement.textContent = `${userName} 님의 즐겨찾기`;
    }

    fetchFavorites(sessionId);
});

// 현재 로그인된 사용자 즐겨찾기 가져오기
async function fetchFavorites(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/favorite?session_id=${sessionId}`);
        if (!response.ok) throw new Error("즐겨찾기 가져오기 실패");

        const favorites = await response.json();
        console.log("즐겨찾기 목록", favorites);

        // 👉 2차원 배열을 1차원 배열로 평탄화
        const flatFavorites = favorites.flat();

        renderFavorites(flatFavorites);
    } catch (error) {
        console.error(error);
        alert("즐겨찾기를 불러오는 데 실패했습니다.");
    }
}

async function deleteFavorite(facilityID, categoryID) {
    const session_id = sessionStorage.getItem("session_id");
    if (!session_id) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/deleteFavorite`, {
            // ... (기존 fetch 로직은 동일)
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: session_id,
                facilityID: String(facilityID)
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "서버 응답 파싱 실패" }));
            throw new Error(err.detail || "요청 실패");
        }

        console.log("즐겨찾기 삭제 성공");
        alert("즐겨찾기에서 삭제되었습니다.");

        // [핵심 수정 1] mainPage를 새로고침해야 한다는 신호를 저장합니다.
       // sessionStorage.setItem('mainPageNeedsRefresh', 'true');

        // [핵심 수정 2] 현재 favorite.html 페이지도 새로고침하여 삭제된 항목을 즉시 반영합니다.
        //window.location.reload();
        await fetchFavorites(session_id); // 즐겨찾기 목록을 다시 가져옵니다.
        window.location.reload()
    } catch (error) {
        console.error("즐겨찾기 삭제 중 오류:", error.message);
        alert(error.message || "즐겨찾기 삭제 중 오류가 발생했습니다.");
    }
}
// 즐겨찾기 카드 렌더링
function renderFavorites(favoritesall) {
    const facilityContainer = document.getElementById("facilityCard");
    const outingContainer = document.getElementById("outingCard");
    const leisureContainer = document.getElementById("seniorCard");

    document.getElementById('facility').style.display = 'block';
    document.getElementById("outing").style.display = 'block';
    document.getElementById("seniorCenter").style.display = 'block';

    outingContainer.innerHTML = "";
    facilityContainer.innerHTML = "";
    leisureContainer.innerHTML = "";

    favoritesall.forEach((favorite) => {
        let card;
        if (favorite.category_categoryID === 1) {
            card = createFacilityCard(favorite);
            facilityContainer.appendChild(card);
        } else if (favorite.category_categoryID === 2) {
            card = createOutingCard(favorite);
            outingContainer.appendChild(card);
        } else if (favorite.category_categoryID === 3) {
            card = createLeisureCard(favorite);
            leisureContainer.appendChild(card);
        }
    });
}

// 각 유형별 카드 생성 함수
function createFacilityCard(favorite) {
    const card = document.createElement("div");
    card.className = "card shadow border-0 rounded-4 mb-5";
    card.innerHTML = `
        <div class="card-body p-5" id="${favorite.ID}">
            <button class="position-absolute top-0 end-0 m-3 btn btn-light border-0"
                    onclick="deleteFavorite('${favorite.ID}', '${favorite.category_categoryID}')"
                    title="즐겨찾기 삭제" style="font-size: 0.95rem; line-height: 1;">
                삭제
            </button>
            <div class="row align-items-center gx-5">
                <div class="col text-center text-lg-start mb-4 mb-lg-0">
                    <div class="bg-light p-4 rounded-4">
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
        </div>`;
    return card;
}

function createOutingCard(favorite) {
    const card = document.createElement("div");
    card.className = "card shadow border-0 rounded-4 mb-5";
    card.innerHTML = `
        <div class="card-body p-5" id="${favorite.ID}">
            <button class="position-absolute top-0 end-0 m-3 btn btn-light border-0"
                    onclick="deleteFavorite('${favorite.ID}', '${favorite.category_categoryID}')"
                    title="즐겨찾기 삭제" style="font-size: 0.95rem; line-height: 1;">
                삭제
            </button>
            <div class="row align-items-center gx-5">
                <div class="col text-center text-lg-start mb-4 mb-lg-0">
                    <div class="bg-light p-4 rounded-4">
                        <div class="text-secondary fw-bolder mb-2">${favorite.name}</div>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="mb-2"><strong>주소:</strong> ${favorite.address || '정보 없음'}</div>
                </div>
            </div>
        </div>`;
    return card;
}

function createLeisureCard(favorite) {
    const card = document.createElement("div");
    card.className = "card shadow border-0 rounded-4 mb-5";
    card.innerHTML = `
        <div class="card-body p-5" id="${favorite.ID}">
            <button class="position-absolute top-0 end-0 m-3 btn btn-light border-0"
                    onclick="deleteFavorite('${favorite.ID}', '${favorite.category_categoryID}')"
                    title="즐겨찾기 삭제" style="font-size: 0.95rem; line-height: 1;">
                삭제
            </button>
            <div class="row align-items-center gx-5">
                <div class="col text-center text-lg-start mb-4 mb-lg-0">
                    <div class="bg-light p-4 rounded-4">
                        <div class="text-warning fw-bolder mb-2">${favorite.name}</div>
                        <div class="mb-2"><div class="small fw-bolder">${favorite.smallLeisure || '소분류 없음'}</div></div>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div>${favorite.address || '주소 없음'}</div>
                </div>
            </div>
        </div>`;
    return card;
}

function formatTime(seconds) {
    if (!seconds || seconds === 0) return "-";
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
