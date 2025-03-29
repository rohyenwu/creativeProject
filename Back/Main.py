from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import uuid
from fastapi.responses import JSONResponse
import DBConnection  # DBConnection 모듈 임포트

app = FastAPI()

# 세션 관리용 임시 저장소 (서버 메모리)
active_sessions = {}

class LoginRequest(BaseModel):
    username: str
    password: str

# 로그인 요청 처리
@app.post("/login")
async def login(request: LoginRequest):
    # DB 연결 가져오기
    conn = await DBConnection.get_db_connection()
    
    try:
        async with conn.cursor(dictionary=True) as cursor:
            # 사용자 인증 쿼리
            query = "SELECT * FROM users WHERE username = %s AND password = %s"
            await cursor.execute(query, (request.username, request.password))
            user = await cursor.fetchone()

            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            # 로그인 성공 후 세션 ID 생성
            session_id = str(uuid.uuid4())  # 고유 세션 ID 생성
            active_sessions[session_id] = {"username": request.username}

            # 세션 ID를 쿠키로 전달
            response = JSONResponse(content={"message": "Login successful", "session_id": session_id})
            response.set_cookie(key="session_id", value=session_id)  # 세션 ID를 쿠키에 저장
            return response

    finally:
        # DB 연결 반납
        await DBConnection.release_db_connection(conn)


# 로그아웃 처리
@app.post("/logout")
async def logout(session_id: str):
    # 세션을 종료하고 DB 연결을 반납
    if session_id in active_sessions:
        del active_sessions[session_id]
        return {"message": "Logged out successfully"}
    else:
        raise HTTPException(status_code=400, detail="Session not found")
