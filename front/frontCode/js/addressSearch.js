function searchLocation(event) {
    if (event) event.preventDefault();
    var address = document.getElementById("location").value;
    if (!address) return;

    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address,
        function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                map.setCenter(coords);
                marker.setPosition(coords);
            }
        });
}
function searchAddress() {
    var postcode = new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById("location").value = data.address;
            searchLocation();
        }
    });

    postcode.open({ popupName: 'postcodePopup' }); // 팝업 모드로 열기
}