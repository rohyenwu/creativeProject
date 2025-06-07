from pydantic import BaseModel
class MembershipRequest(BaseModel):
    userID:str
    password:str
    userName:str
    userGrade:int
class LoginRequest(BaseModel):
    userID: str
    password: str
class SearchRequest(BaseModel):
    lat: float
    lon: float
    categoryID: int
    type: str
class FavoriteRequest(BaseModel):
    session_id: str
    facilityID: str
    categoryID: int
class DeleteFavoriteRequest(BaseModel):
    session_id: str
    facilityID: str