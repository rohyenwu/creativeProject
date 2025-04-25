from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from Back.Model.userModel import UserModel
from Back.Schemas.userScheme import LoginRequest, MembershipRequest
import uuid

router = APIRouter()
active_sessions = {}

@router.post("/membership")
async def membership(request: MembershipRequest):
    await UserModel.insert_user(request.userID, request.password, request.userName)
    return JSONResponse(content={"message": True})

@router.post("/login")
async def login(request: LoginRequest):
    user = await UserModel.get_user_by_credentials(request.userID, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session_id = str(uuid.uuid4())
    active_sessions[session_id] = {"userID": request.userID}
    response = JSONResponse(content={"message": True, "session_id": session_id, "userName": user["userName"]})
    response.set_cookie(key="session_id", value=session_id)
    return response

@router.post("/logout")
async def logout(session_id: str):
    active_sessions.pop(session_id, None)
    return {"message": True}