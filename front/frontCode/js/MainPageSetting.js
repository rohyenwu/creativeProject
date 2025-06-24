let map, marker;
let currentLat, currentLng;
let currCategory = 0;

window.onload = function () {
    const mapContainer = document.getElementById('map');
    const mapOptions = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 5
    };

    map = new kakao.maps.Map(mapContainer, mapOptions);

    marker = new kakao.maps.Marker({
        position: map.getCenter(),
        map: map
    });
};

function searchAddress() {
    const postcode = new daum.Postcode({
        oncomplete: function (data) {
            document.getElementById("location").value = data.address;
            searchLocation();
        }
    });

    postcode.open({ popupName: 'postcodePopup' });
}

function searchLocation(event) {
    if (event) event.preventDefault();

    const address = document.getElementById("location").value;
    if (!address) return;

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            map.setCenter(coords);
            marker.setPosition(coords);

            currentLat = result[0].y;
            currentLng = result[0].x;
        }
    });
}

function toggleDropdowns() {
    const total = document.getElementById('total').checked;
    const publicFacility = document.getElementById('publicFacility').checked;
    const community = document.getElementById('community').checked;
    const outing = document.getElementById('outing').checked;
    const hospital = document.getElementById('hospital').checked;

    const dropdownFacility = document.getElementById('facilityDropdownFacility');
    const dropdownCommunity = document.getElementById('facilityDropdownCommunity');

    // 모두 숨기고
    dropdownFacility.style.display = 'none';
    dropdownCommunity.style.display = 'none';

    // 선택된 항목만 보이도록 설정
    if (publicFacility) {
        dropdownFacility.style.display = 'block';
        currCategory = 1
    } else if (community) {
        dropdownCommunity.style.display = 'block';
        currCategory = 3
    }else if (outing) {
        currCategory = 2
    }else if(total){
        currCategory = 0;
    }else if(hospital) {
        currCategory = 4
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:8000";
    const sessionId = sessionStorage.getItem("session_id");
    const logoutBtn = document.getElementById("logoutBtn");

    // 로그인/비로그인 상태에 따른 메뉴 표시
    if (sessionId) {
        document.getElementById("favoriteMenu").style.display = "block";
        document.getElementById("nonSignInUser").style.display = "none";
        document.getElementById("logoutMenu").style.display = "block";
    } else {
        document.getElementById("favoriteMenu").style.display = "none";
        document.getElementById("nonSignInUser").style.display = "block";
        document.getElementById("logoutMenu").style.display = "none";
    }

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const sessionId = sessionStorage.getItem("session_id");

        try {
            if (sessionId) {
                const bodyData = JSON.stringify({ session_id: sessionId });

                const response = await fetch("http://localhost:8000/logout", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: bodyData,
                });

                if (response.ok) {
                    console.log("✅ 서버 로그아웃 성공");
                } else {
                    console.error("❌ 서버 로그아웃 실패:", response.statusText);
                }
            }
        } catch (error) {
            console.error("❌ 로그아웃 요청 중 오류 발생:", error);
        } finally {
            // ✅ 세션스토리지 전체 초기화 후 로그인 페이지 이동
            sessionStorage.clear();
            alert("로그아웃 되었습니다.");
            window.location.reload();  // ✅ 페이지 새로고침
        }
    });
}
});

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const resizer = document.getElementById('resizer');

// Toggle hide/show
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('minimized');
    toggleBtn.innerHTML = sidebar.classList.contains('minimized') ? '&laquo;' : '&raquo;';
});

// Drag resize
let isResizing = false;

resizer.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
});

window.addEventListener('mousemove', function (e) {
    if (!isResizing) return;
    const windowWidth = window.innerWidth;
    const newWidth = windowWidth - e.clientX;
    if (newWidth >= 200 && newWidth <= 1200) {
        sidebar.style.width = newWidth + 'px';
        toggleBtn.style.right = newWidth + 'px';
    }
});

window.addEventListener('mouseup', function () {
    isResizing = false;
    document.body.style.cursor = '';
});

async function saveDefaultAddress() {
    const sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
        alert("로그인 후 이용 가능한 기능입니다.");
        return;
    }

    const address = document.getElementById("location").value;

    if (!address || typeof currentLat === 'undefined' || typeof currentLng === 'undefined') {
        alert("먼저 주소를 검색해주세요. 저장할 위치 정보가 없습니다.");
        return;
    }

    const requestBody = {
        session_id: sessionId,
        address: address,
        lat: currentLat,
        lon: currentLng
    };

    try {
        // --- 수정된 부분 ---
        const response = await fetch('http://localhost:8000/defaultAddress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            alert('"' + address + '" 주소가 기본 위치로 저장되었습니다.');
        } else {
            // CORS 에러 등이 발생할 수 있으므로, 에러를 JSON이 아닌 텍스트로 먼저 확인합니다.
            const errorText = await response.text();
            console.error("저장 실패 응답:", errorText);
            alert(`저장에 실패했습니다. 개발자 콘솔을 확인해주세요.`);
        }
    } catch (error) {
        console.error("기본 주소 저장 중 네트워크 오류 발생. CORS 정책을 확인해주세요.", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
}

async function clearDefaultAddress() {
    const sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
        alert("로그인 후 이용 가능한 기능입니다.");
        return;
    }

    if (!confirm("저장된 기본 주소를 삭제하시겠습니까?")) {
        return;
    }

    const requestBody = {
        session_id: sessionId,
        address: "__CLEARED__",
        lat: 0,
        lon: 0
    };

    try {
        // 기존의 /defaultAddress POST 엔드포인트를 그대로 사용합니다.
        const response = await fetch('http://localhost:8000/defaultAddress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            document.getElementById("location").value = '';
            alert("저장된 기본 위치가 삭제되었습니다.");

            // 전역 좌표 변수도 초기화
            currentLat = undefined;
            currentLng = undefined;
        } else {
            const errorData = await response.json();
            alert(`삭제에 실패했습니다: ${errorData.detail || '알 수 없는 오류'}`);
        }
    } catch (error) {
        console.error("기본 주소 삭제 중 네트워크 오류 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    }
}
