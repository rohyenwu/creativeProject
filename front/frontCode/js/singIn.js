document.addEventListener("DOMContentLoaded", function() {
    const message = document.getElementById("message");

    document.getElementById("submitButton").addEventListener("click", async function(event) {
        //로그인 함수 구현부분
        event.preventDefault(); // 기본 빈칸 제출 동작 막기

        const userID = document.getElementById("userID").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                credentials: "include", // 쿠키 포함
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: userID, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                // 세션 ID는 쿠키로 관리하기?
                sessionStorage.setItem("session_id", data.session_id);
                sessionStorage.setItem("userName", data.userName);

                // 메인 페이지로 이동
                window.location.href = "mainPage.html"; // 일단 비회원 페이지 이동
            } else {
                message.textContent = data.detail || "로그인 실패";
            }
        } catch (error) {
            message.textContent = "서버에 연결할 수 없습니다.";
            console.error(error);
        }
    });

    document.getElementById("nonMember").addEventListener("click", function() {
        window.location.href = "mainPage.html"; // 비회원 페이지 이동
    });
});
