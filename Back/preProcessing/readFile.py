import pandas as pd

class readFile:
    # 클래스 변수로 열 이름 정의
    public_facilities_rows = (
        "개방시설명", 
        "개방시설유형구분", 
        "휴관일", 
        "평일운영시작시각", 
        "평일운영종료시각", 
        "주말운영시작시각", 
        "주말운영종료시각", 
        "유료사용여부", 
        "소재지도로명주소", 
        "위도", 
        "경도", 
        "사용안내전화번호", 
        "홈페이지주소", 
        "제공기관명"
    )
    
    outing_rows = (
        "ESNTL_ID", 
        "FCLTY_NM", 
        "LNM_ADDR", 
        "FCLTY_LA", 
        "FCLTY_LO"
    )
    
    leisure_rows = (
        "ID",
        "MLSFC_NM", 
        "FCLTY_NM", 
        "RDNMADR_NM", 
        "FCLTY_LO", 
        "FCLTY_LA"
    )
    hospital_rows=(
        "번호",
        "업태구분명",
        "사업장명",
        "도로명전체주소",
        "경도",
        "위도",
        "진료과목내용"
    )
    
    def read_public_facilities(self):
        # CSV 파일 읽기
        df = pd.read_csv('csv/publicFacilities.csv', encoding='euc-kr')
        
        # 'public_facilities_rows'에 해당하는 열만 선택
        result = df[list(self.public_facilities_rows)]
        # 출력 예시
        print(result.head())  # 첫 5개 행 출력
        return result
    
    def read_outing_facilities(self):
                # CSV 파일 읽기
        df = pd.read_csv('csv/outingFacilities.csv', encoding='euc-kr')
        
        result = df[list(self.outing_rows)]
        print(result.head())  # 첫 5개 행 출력

        return result
    
    def read_leisure_facilities(self):
                        # CSV 파일 읽기
        df = pd.read_csv('csv/leisureFacilities.csv', encoding='utf-8')
        result = df[list(self.leisure_rows)]
        print(result.head())  # 첫 5개 행 출력
        return result
    
    def read_hospital_facilities(self):
        df=pd.read_csv('csv/hospitalFacilities.csv', encoding='euc-kr')
        result=df[list(self.hospital_rows)]
        return result
    
if __name__ == '__main__':
    read_file = readFile()  # 인스턴스 생성
    public_facilities = read_file.read_public_facilities()  # 데이터 읽기
    outing_facilities=read_file.read_outing_facilities()
    leisure_facilities=read_file.read_leisure_facilities()
    
    print(public_facilities.head())
    print(outing_facilities.head())
    print(leisure_facilities.head())