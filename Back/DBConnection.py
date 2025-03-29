import aiomysql

class DBConnection:
    pool = None

    @classmethod
    async def init_pool(cls):
        """DB 연결 풀을 초기화하는 메서드"""
        if cls.pool is None:
            cls.pool = await aiomysql.create_pool(
                host="localhost",
                user="root",
                password="password",
                db="test_db",
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
