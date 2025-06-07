from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from Back.Model.userModel import UserModel
from Back.Schemas.userScheme import LoginRequest, MembershipRequest, SearchRequest, FavoriteRequest, DeleteFavoriteRequest
from Back.Service.searchService import searchService
from Back.Model.favoriteModel import FavoriteModel
from Back.Service.adminService import adminService
import uuid
from typing import Optional
router = APIRouter()
active_sessions = {}

@router.post("/membership")
async def membership(request: MembershipRequest):
    await UserModel.insert_user(request.userID, request.password, request.userName, request.userGrade)
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

@router.post("/search")
async def search(request: SearchRequest):
    result = await searchService.get_facilities_list(request.categoryID, request.lat, request.lon, request.type)
    return result

@router.get("/favorite")
async def get_favorite(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    
    userID = active_sessions[session_id]["userID"]
    result = await searchService.get_favorite_facilities(userID)
    return result

@router.post("/addFavorite")
async def add_favorite(request: FavoriteRequest):
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    userID = active_sessions[request.session_id]["userID"]
    result = await FavoriteModel.insert_favorite(userID, request.facilityID, request.categoryID)
    return {"message": result}

@router.post("/deleteFavorite")
async def delete_favorite(request: DeleteFavoriteRequest):
    if request.session_id not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid session ID")
    
    userID = active_sessions[request.session_id]["userID"]
    result = await FavoriteModel.delete_favorite(userID, request.facilityID)
    return {"message": result}
@router.post("/adminPage")
async def upload_admin_files(
    file1: Optional[UploadFile] = File(default=None),  # public
    file2: Optional[UploadFile] = File(default=None),  # outing
    file3: Optional[UploadFile] = File(default=None),  # leisure
    file4: Optional[UploadFile] = File(default=None),  # hospital
):
    # 프론트에서 온 파일들을 순서에 따라 변수에 담기만 함
    public = file1
    outing = file2
    leisure = file3
    hospital = file4

    # 그대로 adminService로 넘김
    await adminService.DB_Update(public, outing, leisure, hospital)

    return {"message": "Files passed to DB_Update"}