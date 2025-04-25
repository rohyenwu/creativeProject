
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("submitButton").addEventListener("click", async function () {
        const id = document.getElementById("id").value.trim();
        const name = document.getElementById("name").value.trim();
        const password = document.getElementById("password").value;
        const passwordCheck = document.getElementById("passwordCheck").value;

        // 간단한 유효성 검사
        if (!id || !name || !password || !passwordCheck) {
            alert("모든 항목을 입력해 주세요.");
            return;
        }

        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/membership", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userID: id,
                    userName: name,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("회원가입이 완료되었습니다!");
                window.location.href = "login.html"; // 로그인 페이지로 이동
            } else {
                alert("회원가입 실패: " + (data.detail || "서버 오류"));
            }
        } catch (error) {
            console.error("회원가입 오류:", error);
            alert("회원가입 중 오류가 발생했습니다.");
        }
    });
});

