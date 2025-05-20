import aiomysql
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()
print(f"DB_HOST: {os.getenv('DB_HOST')}")  # DB_HOST 값이 제대로 로드되었는지 확인

class DBConnection:
    pool = None

    @classmethod
    async def init_pool(cls):
        """DB 연결 풀을 초기화하는 메서드"""
        if cls.pool is None:
            try:
                cls.pool = await aiomysql.create_pool(
                    host=os.getenv("DB_HOST"),  # 환경 변수에서 DB_HOST 가져오기
                    user=os.getenv("DB_USER"),  # 환경 변수에서 DB_USER 가져오기
                    password=os.getenv("DB_PASSWORD"),
                    db=os.getenv("DB_NAME"),  # 환경 변수에서 DB_NAME 가져오기
                    charset="utf8mb4",  # 🔥 꼭 넣기!
                    maxsize=10,  # 최대 연결 수
                )


            except Exception as e:
                print(f"❌ DB 연결 실패: {e}")  # 연결 실패 메시지
            finally:
                print(os.getenv("DB_HOST"))  # DB_HOST 값이 13.135.32.12로 제대로 로드되었는지 확인
                print(os.getenv("DB_USER"))
                print(os.getenv("DB_NAME"))

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
    @classmethod
    async def close_pool(cls):
        """✅ 추가된 메서드: 연결 풀 종료"""
        if cls.pool:
            cls.pool.close()
            await cls.pool.wait_closed()
            cls.pool = None