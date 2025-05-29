import Back.Model.DBConnection as DBConnection
import aiomysql

class FavoriteModel:
    @staticmethod
    async def insert_favorite(userID, facilityID, categoryID):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "INSERT INTO favorites(users_userID, placeID, categoryID) VALUES (%s, %s, %s)"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID, facilityID, categoryID))
            await conn.commit()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
    
    @staticmethod
    async def delete_favorite(userID, facilityID):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "DELETE FROM favorites WHERE users_userID = %s AND placeID = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID, facilityID))
            await conn.commit()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)

    @staticmethod
    async def delete_all_favorites_by_user(userID):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "DELETE FROM favorites WHERE users_userID = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID,))
            await conn.commit()
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
    
    @staticmethod
    async def get_favorite(userID):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query = "SELECT * FROM favorites WHERE users_userID = %s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (userID,))
                results = await cursor.fetchall()
                if not results:
                    return []  # 결과가 없으면 빈 리스트 반환
                return results
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)