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
