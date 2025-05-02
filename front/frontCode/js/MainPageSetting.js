let map, marker;
let currentLat, currentLng; // displayFacility에서 사용

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
    const publicFacility = document.getElementById('publicFacility').checked;
    const cultureFestival = document.getElementById('cultureFestival').checked;

    const dropdownFacility = document.getElementById('facilityDropdownFacilty');
    const dropdownCulture = document.getElementById('facilityDropdownCulture');

    // 모두 숨기고
    dropdownFacility.style.display = 'none';
    dropdownCulture.style.display = 'none';

    // 선택된 항목만 보이도록 설정
    if (publicFacility) {
        dropdownFacility.style.display = 'block';
    } else if (cultureFestival) {
        dropdownCulture.style.display = 'block';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const sessionId = sessionStorage.getItem("sessionId");

    if (sessionId) {
        document.getElementById("favoriteMenu").style.display = "block";
        document.getElementById("nonSignInUser").style.display = "none";
    } else {
        document.getElementById("favoriteMenu").style.display = "none";
        document.getElementById("nonSignInUser").style.display = "block";
    }
});