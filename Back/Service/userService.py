import uuid
from Back.Model.userModel import UserModel

active_sessions = {}

class UserService:
    @staticmethod
    async def register_user(userID, password, userName):
        await UserModel.insert_user(userID, password, userName)

    @staticmethod
    async def login_user(userID, password):
        user = await UserModel.get_user_by_credentials(userID, password)
        if not user:
            return None, None
        session_id = str(uuid.uuid4())
        active_sessions[session_id] = {"userID": userID}
        return session_id, user["userName"]

    @staticmethod
    def logout_user(session_id: str):
        active_sessions.pop(session_id, None)

    @staticmethod
    def get_active_sessions():
        return active_sessions
