document.addEventListener("DOMContentLoaded", function() {
    // HTML 요소 가져오기
    const userIDInput = document.getElementById("userID");
    const passwordInput = document.getElementById("password");
    const submitButton = document.getElementById("submitButton");
    const adminLoginBtn = document.getElementById("adminLoginBtn"); // 관리자 버튼도 가져옵니다.
    const nonMemberButton = document.getElementById("nonMember");
    const message = document.getElementById("message");

    // 로그인 처리를 하나의 함수로 통합합니다.
    async function handleLogin() {
        const userID = userIDInput.value;
        const password = passwordInput.value;

        // 1. 먼저, 하드코딩된 관리자 계정인지 확인합니다.
        const adminId = '1';
        const adminPw = '1';

        if (userID === adminId && password === adminPw) {
            alert('관리자 로그인 성공! 관리자 페이지로 이동합니다.');
            window.location.href = 'adminPage.html';
            return; // 관리자 로그인이 성공했으므로 여기서 함수를 종료합니다.
        }

        // 2. 관리자 계정이 아니라면, 일반 사용자로 서버에 로그인을 시도합니다.
        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                credentials: "include", // 쿠키 포함
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: userID, password: password })
            });

            const data = await response.json();

            if (response.ok && data.session_id) {
                // 로그인 성공
                sessionStorage.setItem("session_id", data.session_id);
                sessionStorage.setItem("userName", data.userName);
                document.cookie = `sessionId=${data.session_id}; path=/; max-age=3600;`; // 1시간 유지
                document.cookie = `userName=${data.userName}; path=/; max-age=3600;`;

                // 메인 페이지로 이동
                window.location.href = "mainPage.html";
            } else {
                // 로그인 실패 (서버에서 session_id를 주지 않거나, 응답 코드가 ok가 아님)
                // 서버에서 보낸 에러 메시지가 있다면 그걸 쓰고, 없다면 기본 메시지를 사용합니다.
                alert(data.detail || "아이디 또는 비밀번호가 잘못되었습니다.");
                message.textContent = data.detail || "로그인에 실패했습니다.";
            }
        } catch (error) {
            message.textContent = "서버에 연결할 수 없습니다.";
            console.error("Login Error:", error);
        }
    }

    // 일반 로그인 버튼 클릭 시 통합 로그인 함수 실행
    submitButton.addEventListener("click", function(event) {
        event.preventDefault(); // form의 기본 제출 동작 막기
        handleLogin();
    });

    // 관리자용 로그인 버튼 클릭 시에도 동일한 통합 로그인 함수 실행
    adminLoginBtn.addEventListener("click", function(event) {
        event.preventDefault();
        handleLogin();
    });

    // 비회원 버튼
    nonMemberButton.addEventListener("click", function() {
        window.location.href = "mainPage.html";
    });

    // 엔터 키로 로그인 시도
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });
});