import aiomysql
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

class DBConnection:
    pool = None

    @classmethod
    async def init_pool(cls):
        """DB 연결 풀을 초기화하는 메서드"""
        if cls.pool is None:
            cls.pool = await aiomysql.create_pool(
                host=os.getenv("DB_HOST"),  # 환경 변수에서 DB_HOST 가져오기
                user=os.getenv("DB_USER"),  # 환경 변수에서 DB_USER 가져오기
                password=os.getenv("DB_PASSWORD"),  # 환경 변수에서 DB_PASSWORD 가져오기
                db=os.getenv("DB_NAME"),  # 환경 변수에서 DB_NAME 가져오기
                maxsize=10,  # 최대 연결 수
            )

    @classmethod
    async def get_db_connection(cls):
        """DB 연결 풀에서 하나의 연결을 가져오는 메서드"""
        if not cls.pool:
            await cls.init_pool()
        return await cls.pool.acquire()

    @classmethod
    async def release_db_connection(cls, conn):
        """DB 연결을 풀에 반납하는 메서드"""
        if cls.pool:
            await cls.pool.release(conn)