import asyncio
from Back.preProcessing.readFile import readFile
from Back.Model.DBConnection import DBConnection

# NaN 안전 처리 함수
def safe(value):
    return None if (value != value or value is None) else value

# public 테이블 삽입
async def insert_public_facilities(public_facilities):
    conn = await DBConnection.get_db_connection()
    try:
        async with conn.cursor() as cursor:
            for idx, row in public_facilities.iterrows():
                await cursor.execute("""
                    INSERT INTO public (
                        ID, name, closedDays, weekOpenTime, weekClosedTime, weekendOpenTime, weekendClosedTime,
                        isPayed, address, latitude, longitude, `call`, homepageAddress, mangementName, category_categoryID
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
                """, (
                    idx + 1,
                    safe(row["개방시설명"]),
                    safe(row["휴관일"]),
                    safe(row["평일운영시작시각"]),
                    safe(row["평일운영종료시각"]),
                    safe(row["주말운영시작시각"]),
                    safe(row["주말운영종료시각"]),
                    1 if safe(row["유료사용여부"]) == "Y" else 0,
                    safe(row["소재지도로명주소"]),
                    safe(row["위도"]),
                    safe(row["경도"]),
                    safe(row["사용안내전화번호"]),
                    safe(row["홈페이지주소"]),
                    safe(row["제공기관명"])
                ))
            await conn.commit()
        print("✅ public 테이블에 데이터 삽입 완료!")
    except Exception as e:
        print(f"❌ 오류 발생 (public): {e}")
    finally:
        await DBConnection.release_db_connection(conn)

# outing 테이블 삽입
async def insert_outing_facilities(outing_facilities):
    conn = await DBConnection.get_db_connection()
    try:
        async with conn.cursor() as cursor:
            for idx, row in outing_facilities.iterrows():
                await cursor.execute("""
                    INSERT INTO outing (
                        ID, name, address, latitude, longitude, category_categoryID
                    ) VALUES (%s, %s, %s, %s, %s, 2)
                """, (
                    idx + 1,
                    safe(row["FCLTY_NM"]),
                    safe(row["LNM_ADDR"]),
                    safe(row["FCLTY_LA"]),
                    safe(row["FCLTY_LO"])
                ))
            await conn.commit()
        print("✅ outing 테이블에 데이터 삽입 완료!")
    except Exception as e:
        print(f"❌ 오류 발생 (outing): {e}")
    finally:
        await DBConnection.release_db_connection(conn)

# leisure 테이블 삽입
async def insert_leisure_facilities(leisure_facilities):
    conn = await DBConnection.get_db_connection()
    try:
        async with conn.cursor() as cursor:
            for idx, row in leisure_facilities.iterrows():
                await cursor.execute("""
                    INSERT INTO leisure (
                        ID, smallLeisure, address, latitude, longitude, name, category_categoryID
                    ) VALUES (%s, %s, %s, %s, %s, %s, 3)
                """, (
                    safe(row["ID"]),
                    safe(row["MLSFC_NM"]),
                    safe(row["RDNMADR_NM"]),
                    safe(row["FCLTY_LA"]),
                    safe(row["FCLTY_LO"]),
                    safe(row["FCLTY_NM"])
                ))
            await conn.commit()
        print("✅ leisure 테이블에 데이터 삽입 완료!")
    except Exception as e:
        print(f"❌ 오류 발생 (leisure): {e}")
    finally:
        await DBConnection.release_db_connection(conn)

# main 함수
async def main():
    await DBConnection.init_pool()

    reader = readFile()
    public_facilities = reader.read_public_facilities()
    outing_facilities = reader.read_outing_facilities()
    leisure_facilities = reader.read_leisure_facilities()

    await insert_public_facilities(public_facilities)
    await insert_outing_facilities(outing_facilities)
    await insert_leisure_facilities(leisure_facilities)

    await DBConnection.close_pool()

if __name__ == "__main__":
    asyncio.run(main())
