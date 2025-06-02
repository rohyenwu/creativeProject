import pandas as pd
import aiomysql
import asyncio
import os
from dotenv import load_dotenv
from Back.Model.DBConnection import DBConnection

# 공통 함수: 고유 식별자 생성

def generate_hospital_key(row):
    return int(row["ID"])

def generate_outing_key(row):
    return row["ID"]

def generate_leisure_key(row):
    return row["ID"]

# 🔹 고유키 생성 함수: 이름 + 유형
def generate_public_key(row):
    name = str(row["개방시설명"]).strip().replace(" ", "").lower()
    category = str(row["개방시설유형구분"]).strip().replace(" ", "").lower()
    return f"{name}_{category}"


# 공통 함수: DB에서 데이터 조회

async def fetch_db_data(conn, query):
    async with conn.cursor(aiomysql.DictCursor) as cursor:
        await cursor.execute(query)
        return await cursor.fetchall()
    
# 🔹 CSV 로드 및 전처리
def load_public_csv(csv_path):
    df = pd.read_csv(csv_path, encoding="euc-kr")
    df = df.dropna(subset=["개방시설명", "위도", "경도"])
    df = df.fillna("")
    return df.to_dict(orient="records")
# 병원 CSV 로드

def load_hospital_csv(csv_path):
    df = pd.read_csv(csv_path, encoding="euc-kr")
    df = df[["번호", "사업장명", "업태구분명", "도로명전체주소", "경도", "위도", "진료과목내용"]]
    df = df.dropna(subset=["번호", "사업장명", "도로명전체주소"])
    df = df.fillna({"경도": 0, "위도": 0, "진료과목내용": ""})
    df = df.rename(columns={
        "번호": "ID",
        "사업장명": "hospitalName",
        "업태구분명": "type",
        "도로명전체주소": "address",
        "경도": "longitude",
        "위도": "latitude",
        "진료과목내용": "medicalDepartment"
    })
    return df.to_dict(orient="records")

# 나들이 CSV 로드

def load_outing_csv(csv_path):
    df = pd.read_csv(csv_path, encoding="euc-kr")
    df = df.dropna(subset=["ESNTL_ID", "FCLTY_NM", "FCLTY_LA", "FCLTY_LO"])
    df = df.fillna({"LNM_ADDR": ""})
    df = df.rename(columns={
        "ESNTL_ID":"ID",
        "FCLTY_NM": "name",
        "FCLTY_LA": "latitude",
        "FCLTY_LO": "longitude",
        "LNM_ADDR": "address"
    })
    return df.to_dict(orient="records")

# 여가 CSV 로드

def load_leisure_csv(csv_path):
    df = pd.read_csv(csv_path, encoding="UTF-8")
    df = df.dropna(subset=["ID", "FCLTY_NM", "FCLTY_LA", "FCLTY_LO", "MLSFC_NM"])
    df = df.fillna({"RDNMADR_NM": ""})
    df = df.rename(columns={
        "FCLTY_NM": "name",
        "FCLTY_LA": "latitude",
        "FCLTY_LO": "longitude",
        "RDNMADR_NM": "address",
        "MLSFC_NM": "smallLeisure"
    })
    return df.to_dict(orient="records")

# 병원 테이블 동기화

async def sync_hospital_table(csv_path):
    csv_data = load_hospital_csv(csv_path)
    csv_map = {generate_hospital_key(row): row for row in csv_data}

    conn = await DBConnection.get_db_connection()
    db_data = await fetch_db_data(conn, "SELECT ID FROM hospital")
    db_map = {generate_hospital_key(row): row for row in db_data}

    to_delete = [db_map[key] for key in db_map if key not in csv_map]
    to_insert = [csv_map[key] for key in csv_map if key not in db_map]

    async with conn.cursor() as cursor:
        for row in to_delete:
            print(f"🗑️ 삭제: ID={row['ID']}")
            await cursor.execute("DELETE FROM favorites WHERE placeID = %s AND categoryID = 4", (row["ID"],))
            await cursor.execute("DELETE FROM hospital WHERE ID = %s", (row["ID"],))

        for row in to_insert:
            print(f"➕ 삽입: ID={row['ID']}")
            await cursor.execute("""
                INSERT INTO hospital (
                    ID, hospitalName, type, address, longitude, latitude, medicalDepartment, category_categoryID
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, 4)
            """, (
                int(row["ID"]),
                row["hospitalName"],
                row["type"],
                row["address"],
                float(row["longitude"]),
                float(row["latitude"]),
                row.get("medicalDepartment", "")
            ))

        await conn.commit()
    await DBConnection.release_db_connection(conn)
    print("✅ 병원 테이블 동기화 완료!")

# 나들이 테이블 동기화

async def sync_outing_table(csv_path):
    csv_data = load_outing_csv(csv_path)
    csv_map = {generate_outing_key(row): row for row in csv_data}

    conn = await DBConnection.get_db_connection()
    db_data = await fetch_db_data(conn, "SELECT ID FROM outing")
    db_map = {generate_outing_key(row): row for row in db_data}

    to_delete = [db_map[key] for key in db_map if key not in csv_map]
    to_insert = [csv_map[key] for key in csv_map if key not in db_map]

    async with conn.cursor() as cursor:
        for row in to_delete:
            print(f"🗑️ 삭제: {row['ID']}")
            await cursor.execute("DELETE FROM favorites WHERE placeID = (SELECT ID FROM outing WHERE ID = %s) AND categoryID = 2", (row["ID"],))
            await cursor.execute("DELETE FROM outing WHERE ID = %s", (row["ID"],))

        for row in to_insert:
            print(f"➕ 삽입: {row['name']}")
            await cursor.execute("""
                INSERT INTO outing (name, address, latitude, longitude, ID, category_categoryID)
                VALUES (%s, %s, %s, %s, %s, 2)
            """, (
                row["name"],
                row["address"],
                float(row["latitude"]),
                float(row["longitude"]),
                row["ID"]
            ))

        await conn.commit()
    await DBConnection.release_db_connection(conn)
    print("✅ 나들이 테이블 동기화 완료!")

# 여가 테이블 동기화

async def sync_leisure_table(csv_path):
    csv_data = load_leisure_csv(csv_path)
    csv_map = {generate_leisure_key(row): row for row in csv_data}

    conn = await DBConnection.get_db_connection()
    db_data = await fetch_db_data(conn, "SELECT ID FROM leisure")
    db_map = {generate_leisure_key(row): row for row in db_data}

    to_delete = [db_map[key] for key in db_map if key not in csv_map]
    to_insert = [csv_map[key] for key in csv_map if key not in db_map]

    async with conn.cursor() as cursor:
        for row in to_delete:
            print(f"🗑️ 삭제: {row['ID']}")
            await cursor.execute("DELETE FROM favorites WHERE placeID = (SELECT ID FROM leisure WHERE ID = %s) AND categoryID = 3", (row["ID"],))
            await cursor.execute("DELETE FROM leisure WHERE ID = %s", (row["ID"],))

        for row in to_insert:
            print(f"➕ 삽입: {row['name']}")
            await cursor.execute("""
                INSERT INTO leisure (ID, smallLeisure, address, latitude, longitude, name, category_categoryID)
                VALUES (%s, %s, %s, %s, %s, %s, 3)
            """, (
                row["ID"],
                row["smallLeisure"],
                row["address"],
                float(row["latitude"]),
                float(row["longitude"]),
                row["name"]
            ))


        await conn.commit()
    await DBConnection.release_db_connection(conn)
    print("✅ 여가 테이블 동기화 완료!")
    
async def sync_public_table(csv_path):
    csv_data = load_public_csv(csv_path)

    # 고유키: 이름 + 유형 (정규화된 문자열 기준)
    csv_keys = {generate_public_key(row): row for row in csv_data}

    conn = await DBConnection.get_db_connection()
    db_data = await fetch_db_data(conn, "SELECT * FROM public")

    db_keys = {
        generate_public_key({
            "개방시설명": row["name"],
            "개방시설유형구분": row.get("type", "")  # DB에 저장된 유형 컬럼 이름에 맞게 조정
        }): row for row in db_data
    }

    to_delete = [db_keys[key] for key in db_keys if key not in csv_keys]
    to_insert = [csv_keys[key] for key in csv_keys if key not in db_keys]

    async with conn.cursor() as cursor:
        for row in to_delete:
            print(f"🗑️ 삭제: ID={row['ID']}")
            await cursor.execute("DELETE FROM favorites WHERE placeID = %s AND categoryID = 1", (row["ID"],))
            await cursor.execute("DELETE FROM public WHERE ID = %s", (row["ID"],))

        for row in to_insert:
            try:
                print(f"➕ 삽입: {row['개방시설명']} ({row['개방시설유형구분']})")
                await cursor.execute("""
                    INSERT INTO public (
                        name, type, closedDays, weekOpenTime, weekClosedTime,
                        weekendOpenTime, weekendClosedTime, isPayed,
                        address, latitude, longitude, `call`,
                        homepageAddress, mangementName, category_categoryID
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
                """, (
                    row["개방시설명"],
                    row["개방시설유형구분"],
                    row["휴관일"],
                    row["평일운영시작시각"],
                    row["평일운영종료시각"],
                    row["주말운영시작시각"],
                    row["주말운영종료시각"],
                    1 if str(row["유료사용여부"]).strip().upper() == "Y" else 0,
                    row["소재지도로명주소"],
                    float(row["위도"]),
                    float(row["경도"]),
                    row["사용안내전화번호"],
                    row["홈페이지주소"],
                    row["관리기관명"]
                ))
            except Exception as e:
                print(f"❌ 삽입 실패: {row['개방시설명']} → {e}")

        await conn.commit()
    await DBConnection.release_db_connection(conn)
    print("✅ 공공시설 테이블 동기화 완료!")


# 실행

if __name__ == "__main__":
    load_dotenv()
    # asyncio.run(sync_hospital_table("csv/hospitalFacilities.csv"))
    # asyncio.run(sync_outing_table("csv/outingFacilities.csv"))
    # asyncio.run(sync_leisure_table("csv/leisureFacilities.csv"))
    asyncio.run(sync_public_table("csv/publicFacilities.csv"))
