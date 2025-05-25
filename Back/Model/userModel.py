import Back.Model.DBConnection as DBConnection
import aiomysql

class UserModel:
    @staticmethod
    async def insert_user(userID, password, userName, userGrade):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "INSERT INTO users(userID, password, userName, userCategory_ID) VALUES (%s, %s, %s, %s)"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID, password, userName, userGrade))
            await conn.commit()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)


    @staticmethod
    async def get_user_by_credentials(userID, password):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "SELECT * FROM users WHERE userID = %s AND password = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID, password))
                return await cursor.fetchone()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
