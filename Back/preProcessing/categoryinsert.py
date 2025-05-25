import aiomysql
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def insert_categories(pool):
    query = """
    INSERT INTO category (categoryID, categoryName) VALUES
    (1, '공공시설'),
    (2, '나들이'),
    (3, '복지시설'),
    (4, '병원')
    ON DUPLICATE KEY UPDATE categoryName = VALUES(categoryName);
    """

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(query)
            print("✅ category 테이블에 ID와 이름 삽입 완료")

async def insert_userCategory(pool):
    query = """
    INSERT INTO usercategory (ID, CategoryName) 
    VALUES 
    (1, '일반'),
    (2, '관리자') 
    ON DUPLICATE KEY UPDATE CategoryName = VALUES(CategoryName);
    """

    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(query)
            print("✅ userCategory 테이블에 ID와 이름 삽입 완료")

async def main():
    pool = await aiomysql.create_pool(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        db=os.getenv("DB_NAME"),
        autocommit=True
    )

    # await insert_categories(pool)
    await insert_userCategory(pool)

    pool.close()
    await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
