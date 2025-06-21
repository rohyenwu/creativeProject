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

    @staticmethod
    async def get_user_default_address(userID):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "SELECT address, longitude, latitude FROM users WHERE userID = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID,))
                return await cursor.fetchone()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)

    @staticmethod
    async def update_user_default_address(userID, address, latitude, longitude):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "UPDATE users SET address = %s, latitude = %s, longitude = %s WHERE userID = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (address, latitude, longitude, userID))
            await conn.commit()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)