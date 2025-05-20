import aiomysql
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def insert_categories():
    pool = await aiomysql.create_pool(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        db=os.getenv("DB_NAME"),
        autocommit=True
    )

    query = """
    INSERT INTO category (categoryID, categoryName) VALUES
    (1, '공공시설'),
    (2, '나들이'),
    (3, '여가시설'),
    (4, '병원')
    ON DUPLICATE KEY UPDATE categoryName = VALUES(categoryName);
    """

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(query)
            print("✅ category 테이블에 ID와 이름 삽입 완료")

    pool.close()
    await pool.wait_closed()
async def insert_userCategory():
    pool = await aiomysql.create_pool(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        db=os.getenv("DB_NAME"),
        autocommit=True
    )
    query = """
    INSERT INTO userCategory (ID,CategoryName) 
    VALUES 
    (1,'일반'),
    (2,'관리자') 
    ON DUPLICATE KEY UPDATE CategoryName = VALUES(CategoryName);
    """
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(query)
            print("✅ userCategory 테이블에 ID와 이름 삽입 완료")
    pool.close()
    await pool.wait_closed()

# 단독 실행 시
if __name__ == "__main__":
    asyncio.run(insert_categories())
    asyncio.run(insert_userCategory())
