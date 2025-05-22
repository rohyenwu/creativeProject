import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import math
from Back.Model.searchModel import searchModel

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
        min_lat, max_lat, min_lon, max_lon = searchService.get_bounds(lat, lon,)
        if categoryID == 0:
            facilities_result = await searchModel.get_public('all', min_lat, max_lat, min_lon, max_lon)
            facilities_result += await searchModel.get_outing(min_lat, max_lat, min_lon, max_lon)
            facilities_result += await searchModel.get_leisure('all',min_lat, max_lat, min_lon, max_lon)

        elif categoryID == 1:
            facilities_result = await searchModel.get_public(type, min_lat, max_lat, min_lon, max_lon)

        elif categoryID == 2:
            facilities_result = await searchModel.get_outing(min_lat, max_lat, min_lon, max_lon)

        elif categoryID==3:
            facilities_result = await searchModel.get_leisure(type,min_lat, max_lat, min_lon, max_lon)
        elif categoryID==4:
            facilities_result= await searchModel.get_hospital(min_lat,max_lat,min_lon,max_lon)
            
        
        facilities=facilities_result
        for facility in facilities:
            facility_lat = facility["latitude"]
            facility_lon = facility["longitude"]
            distance = searchService.haversine(lat, lon, facility_lat, facility_lon)
            facility["distance"] = distance

        facilities = [f for f in facilities if f["distance"] <= 15]
        facilities.sort(key=lambda x: x["distance"])

        return categoryID, facilities


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
