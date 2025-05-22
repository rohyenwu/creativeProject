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