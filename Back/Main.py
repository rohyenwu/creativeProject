from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import uuid
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from starlette.middleware.cors import CORSMiddleware

from DBConnection import DBConnection
      # DBConnection 모듈 임포트
import aiomysql



# 세션 관리용 임시 저장소 (서버 메모리)
active_sessions = {}
class MembershipRequest(BaseModel):
    userID:str
    password:str
    userName:str
class LoginRequest(BaseModel):
    userID: str
    password: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시
    await DBConnection.init_pool()
    yield
    # 서버 종료 시 (cleanup 가능)
    await DBConnection.release_db_connection()
app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],            # 허용할 origin
    allow_credentials=True,
    allow_methods=["*"],              # 허용할 HTTP 메서드 (GET, POST 등)
    allow_headers=["*"],              # 허용할 헤더
)
#회원가입 요청 처리
@app.post("/membership")
async def membership(request: MembershipRequest):
    conn = await DBConnection.get_db_connection()
    try:
        query = "INSERT INTO users(userID, password, userName) values(%s,%s,%s)"
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, (request.userID, request.password,request.userName))
        response = JSONResponse(content={"message": True})
        await conn.commit()
        return response
    finally:
        await DBConnection.release_db_connection(conn)

        
# 로그인 요청 처리
@app.post("/login")
async def login(request: LoginRequest):
    # DB 연결 가져오기
    conn = await DBConnection.get_db_connection()
    
    try:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            # 사용자 인증 쿼리
            query = "SELECT * FROM users WHERE userID = %s AND password = %s"
            await cursor.execute(query, (request.userID, request.password))
            user = await cursor.fetchone()

            if not user:
                raise HTTPException(status_code=401, detail="Invalid credentials")

            # 로그인 성공 후 세션 ID 생성
            session_id = str(uuid.uuid4())  # 고유 세션 ID 생성
            active_sessions[session_id] = {"userID": request.userID}
            userName=user["userName"]
            # 세션 ID를 쿠키로 전달
            response = JSONResponse(content={"message": True, "session_id": session_id, "userName":userName})
            response.set_cookie(key="session_id", value=session_id)  # 세션 ID를 쿠키에 저장
            return response

    finally:
        # DB 연결 반납
        await DBConnection.release_db_connection(conn)

# 비회원 처리: 비회원이 요청 시
@app.get("/nonMemberLogin")
async def nonMemberLogin():
    # 비회원의 프로필 정보 반환
    response = JSONResponse(content={"message": True, "userName": "비회원"})
    return response

# 로그아웃 처리
@app.post("/logout")
async def logout(session_id: str):
    active_sessions.pop(session_id, None)  # 없으면 그냥 무시
    return {"message": True}