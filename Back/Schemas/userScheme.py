from pydantic import BaseModel
class MembershipRequest(BaseModel):
    userID:str
    password:str
    userName:str
class LoginRequest(BaseModel):
    userID: str
    password: str
class SearchRequest(BaseModel):
    lat: float
    lon: float
    categoryID: int
    type: str