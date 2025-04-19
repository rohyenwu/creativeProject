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
                host=os.getenv("DB_HOST"),  # 예: localhost
                port=int(os.getenv("DB_PORT")),  # 예: 3306
                user=os.getenv("DB_USER"),  # 예: root
                password=os.getenv("DB_PASSWORD"),  # 예: 1234
                db=os.getenv("DB_NAME"),  # 예: creativeProject
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
