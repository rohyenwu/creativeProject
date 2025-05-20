import Back.Model.DBConnection as DBConnection
import aiomysql
import math
import asyncio
class searchModel:
    @staticmethod
    async def get_public(type, min_lat, max_lat, min_lon, max_lon):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query=f"select * from public where latitude>=%s and latitude<=%s and longitude>=%s and longitude<=%s and type LIKE %s "
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (min_lat, max_lat, min_lon, max_lon, f"%{type}%"))
                results=await cursor.fetchall()
                if not results:
                    return []  # 결과가 없으면 빈 리스트 반환
                return results  
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
    @staticmethod
    async def get_leisure(type, min_lat, max_lat, min_lon, max_lon):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query=f"SELECT * FROM Leisure WHERE latitude >= %s AND latitude <= %s AND longitude >= %s AND longitude <= %s AND smallLeisure = %s;"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (min_lat, max_lat, min_lon, max_lon, type))
                results=await cursor.fetchall()
                if not results:
                    return []  # 결과가 없으면 빈 리스트 반환
                return results  
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
    @staticmethod
    async def get_outing(min_lat, max_lat, min_lon, max_lon):
        conn = await DBConnection.DBConnection.get_db_connection()
        try:
            query=f"select * from outing where latitude>=%s and latitude<=%s and longitude>=%s and longitude<=%s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, (min_lat, max_lat, min_lon, max_lon))
                results=await cursor.fetchall()
                if not results:
                    return []  # 결과가 없으면 빈 리스트 반환
                return results  
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)
    @staticmethod
    async def get_hospital(min_lat, max_lat, min_lon, max_lon):
        conn=await DBConnection.DBConnection.get_db_connection()
        try:
            query=f"select * from hospital where latitud>=%s and latitude<=%s and longitude>=%s and longitude<=%s"
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query,(min_lat,max_lat,min_lon,max_lon))
                results=await cursor.fetchall()
                if not results:
                    return []
                return results
        finally:
            await DBConnection.DBConnection.release_db_connection(conn)