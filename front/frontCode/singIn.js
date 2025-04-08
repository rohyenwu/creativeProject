document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submitButton").addEventListener("click", function(event) {
        //로그인 함수 구현부분
        window.location.href = "mainPage.html"; // 비회원 페이지 이동

    });

    document.getElementById("nonMember").addEventListener("click", function() {
        window.location.href = "mainPage.html"; // 비회원 페이지 이동
    });
});
