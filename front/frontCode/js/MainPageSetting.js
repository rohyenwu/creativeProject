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
    const sessionId = sessionStorage.getItem("session_id");
    const logoutBtn = document.getElementById("logoutBtn");

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
        logoutBtn.addEventListener("click", function () {
            try{
                const response = fetch("http://localhost:8000/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: sessionId })
                });
                if(response.message === "True") {
                    alert("로그아웃 되었습니다.");
                    console.log("Logout successful");
                }
            } catch (error) {
                console.error("Logout Error:", error);
            }
            sessionStorage.removeItem("session_id");
            window.location.href = "mainPage.html";
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


function saveDefaultAddress() {
    const address = document.getElementById("location").value;
    if (!address) {
        alert("먼저 주소를 검색하거나 입력해주세요.");
        return;
    }

    // 'defaultAddress' 라는 이름으로 주소 저장
    localStorage.setItem('defaultAddress', address);
    alert('"' + address + '" 주소가 기본 위치로 저장되었습니다.');
}


function clearDefaultAddress() {
    if (localStorage.getItem('defaultAddress')) {
        localStorage.removeItem('defaultAddress');
        document.getElementById("location").value = '';
        alert("저장된 기본 위치가 삭제되었습니다.");
    } else {
        alert("저장된 기본 위치가 없습니다.");
    }
}

function loadDefaultAddress() {
    const savedAddress = localStorage.getItem('defaultAddress');
    if (savedAddress) {
        document.getElementById("location").value = savedAddress;
        console.log("저장된 기본 위치를 불러왔습니다: " + savedAddress);
        searchLocation();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadDefaultAddress();
});