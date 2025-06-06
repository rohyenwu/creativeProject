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

            if (response.ok && data.session_id) {
                // 세션 ID는 쿠키로 관리하기?
                //세션스토리지
                sessionStorage.setItem("session_id", data.session_id);
                sessionStorage.setItem("userName", data.userName);
                //쿠키
                document.cookie = `sessionId=${data.session_id}; path=/; max-age=3600;` //1시간 유지
                document.cookie = `userName=${data.userName}; path=/; max-age=3600;`

                // 메인 페이지로 이동
                window.location.href = "mainPage.html"; // 일단 비회원 페이지 이동
            } else if(!data.session_id){
                alert("아이디 또는 비밀번호가 잘못되었습니다.")
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

const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminIdInput = document.getElementById('userID');
const adminPwInput = document.getElementById('password');

// 2. '관리자용 로그인' 버튼에 클릭 이벤트 리스너를 추가
adminLoginBtn.addEventListener('click', function() {
    // 3. 사용자가 입력한 아이디와 비밀번호 값 가져오기
    const enteredId = adminIdInput.value;
    const enteredPw = adminPwInput.value;

    // 4. 미리 정해둔 정답 아이디/비밀번호와 비교
    const correctId = '1';
    const correctPw = '1';

    // 5. 조건문(if)을 사용하여 아이디와 비밀번호가 모두 일치하는지 확인
    if (enteredId === correctId && enteredPw === correctPw) {
        // 일치할 경우
        alert('로그인 성공! 관리자 페이지로 이동합니다.');
        // 'adminPage.html'로 페이지 이동
        window.location.href = 'adminPage.html';
    } else {
        // 일치하지 않을 경우
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        // 입력 필드 초기화 (선택사항)
        adminIdInput.value = '';
        adminPwInput.value = '';
        // 다시 아이디 입력창에 포커스를 줌 (사용자 편의)
        adminIdInput.focus();
    }
});

// 엔터 키로도 로그인을 시도할 수 있게 하는 기능 (선택사항)
adminPwInput.addEventListener('keyup', function(event) {
    // event.key가 'Enter'일 경우, 로그인 버튼을 클릭한 것과 동일한 효과를 낸다.
    if (event.key === 'Enter') {
        adminLoginBtn.click();
    }
});