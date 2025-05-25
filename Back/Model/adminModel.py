import Back.Model.DBConnection as DBConnection
import aiomysql
import Back.preProcessing as pre

class adminModel:
    @staticmethod
    async def compare_favorites():
        # 즐겨찾기 데이터 모두 가져오기
        async with DBConnection.DBConnection() as conn:
            query = "SELECT favoritesID, placeID, categoryID FROM favorites"
            async with conn.cursor() as cursor:
                await cursor.execute(query)
                favorites = await cursor.fetchall()

                # 각 즐겨찾기 항목의 placeID와 categoryID를 확인
                for favorite in favorites:
                    place_id = favorite['placeID']
                    category_id = favorite['categoryID']
                    
                    # 해당 categoryID에 맞는 테이블에서 placeID가 존재하는지 확인
                    if category_id == 1:  # 공공시설 (public)
                        print()
                    elif category_id == 2:  # 나들이 (outing)
                        await adminModel.check_and_delete_invalid_favorite(conn, place_id, 'outing')
                    elif category_id == 3:  # 복지시설 (leisure)
                        await adminModel.check_and_delete_invalid_favorite(conn, place_id, 'leisure')

    @staticmethod
    async def check_and_delete_invalid_favorite(conn, place_id, table_name):
        # 해당 테이블에서 placeID가 존재하는지 확인
        query = f"SELECT ID FROM {table_name} WHERE ID = %s"
        
        async with conn.cursor() as cursor:
            await cursor.execute(query, (place_id,))
            result = await cursor.fetchone()

            # 해당 시설이 존재하지 않으면 즐겨찾기 삭제
            if not result:
                delete_query = "DELETE FROM favorites WHERE placeID = %s"
                await cursor.execute(delete_query, (place_id,))
                await conn.commit()
