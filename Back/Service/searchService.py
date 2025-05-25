import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import math
from Back.Model.searchModel import searchModel
from Back.Model.favoriteModel import FavoriteModel

class searchService:
    @staticmethod
    def get_bounds(lat, lon, radius_km=15):
        lat_offset = radius_km / 111
        lon_offset = radius_km / (111 * math.cos(math.radians(lat)))
        min_lat = lat - lat_offset
        max_lat = lat + lat_offset
        min_lon = lon - lon_offset
        max_lon = lon + lon_offset
        return min_lat, max_lat, min_lon, max_lon

    @staticmethod
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    @staticmethod
    async def get_facilities_list(categoryID, lat, lon, type=""):
        min_lat, max_lat, min_lon, max_lon = searchService.get_bounds(lat, lon)

        if categoryID == 0:
            facilities_result1 = await searchModel.get_public('all', min_lat, max_lat, min_lon, max_lon)
            facilities_result2 = await searchModel.get_outing(min_lat, max_lat, min_lon, max_lon)
            facilities_result3 = await searchModel.get_leisure('all', min_lat, max_lat, min_lon, max_lon)

            result = [
                [1, facilities_result1],
                [2, facilities_result2],
                [3, facilities_result3]
            ]

            for category in result:
                facilities = category[1]
                for facility in facilities:
                    facility_lat = facility["latitude"]
                    facility_lon = facility["longitude"]
                    distance = searchService.haversine(lat, lon, facility_lat, facility_lon)
                    facility["distance"] = distance
                facilities = [f for f in facilities if f["distance"] <= 15]
                facilities.sort(key=lambda x: x["distance"])
                category[1] = facilities

            return categoryID, result

        # 그 외 categoryID는 기존처럼 처리
        elif categoryID == 1:
            facilities = await searchModel.get_public(type, min_lat, max_lat, min_lon, max_lon)

        elif categoryID == 2:
            facilities = await searchModel.get_outing(min_lat, max_lat, min_lon, max_lon)

        elif categoryID == 3:
            facilities = await searchModel.get_leisure(type, min_lat, max_lat, min_lon, max_lon)

        elif categoryID == 4:
            facilities = await searchModel.get_hospital(min_lat, max_lat, min_lon, max_lon)

        # 거리 계산
        for facility in facilities:
            facility_lat = facility["latitude"]
            facility_lon = facility["longitude"]
            distance = searchService.haversine(lat, lon, facility_lat, facility_lon)
            facility["distance"] = distance

        facilities = [f for f in facilities if f["distance"] <= 15]
        facilities.sort(key=lambda x: x["distance"])

        return categoryID, facilities


    
    @staticmethod
    async def get_favorite_facilities(userID):
        favorites = await FavoriteModel.get_favorite(userID)
        if not favorites:
            return []
        facilities = [[] for i in range(4)]  # 0: public, 1: outing, 2: leisure, 3: hospital
        null = {
            "category_categoryID": 0, # 이 값이 0이면 데이터가 없는 것으로 간주
            "ID": 0,
            "name": "정보 없음", # 병원 테이블 수정
            "address": "정보 없음",
            "latitude": 0.0, # 병원 테이블 수정
            "longitude": 0.0 # 병원 테이블 수정
        }
        for favorite in favorites:
            categoryID = favorite["categoryID"]
            facilityID = favorite["placeID"]
            if categoryID == 1:
                facility = await searchModel.get_public_by_id(facilityID)
                if facility is None: # 업데이트 후 시설이 조회되지 않을 경우.
                    null["ID"] = facilityID
                    facility = null
            elif categoryID == 2:
                facility = await searchModel.get_outing_by_id(facilityID)
                if facility is None: # 업데이트 후 시설이 조회되지 않을 경우.
                    null["ID"] = facilityID
                    facility = null
            elif categoryID == 3:
                facility = await searchModel.get_leisure_by_id(facilityID)
                if facility is None: # 업데이트 후 시설이 조회되지 않을 경우.
                    null["ID"] = facilityID
                    facility = null
            elif categoryID == 4:
                facility = await searchModel.get_hospital_by_id(facilityID)
                if facility is None: # 업데이트 후 시설이 조회되지 않을 경우.
                    null["ID"] = facilityID
                    facility = null
            if facility:
                facilities[categoryID-1].append(facility)
        return facilities

# 🔥 여기부터 테스트 코드
async def test_get_facilities():
    lat = 36.144417
    lon = 128.393278
    categoryID = 1
    type="전시실"
    # ✅ 여기 searchService 클래스 이름 그대로 써야함
    category, facilities = await searchService.get_facilities_list(categoryID, lat, lon,type)
    print(f"카테고리ID: {category}")
    print(facilities[:5])

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_get_facilities())
