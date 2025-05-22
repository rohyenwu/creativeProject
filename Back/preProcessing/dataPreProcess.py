import os
import pandas as pd
import re

# 프로젝트 루트 찾기
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 시설 유형 리스트 (target_types)
target_types = [
    '생활문화센터', '커뮤니티센터', '게스트하우스', '다목적홀', '강당',
    '소회의실', '대회의실', '세미나실', '회의실', '전시장', '전시실', '체험관', '체험장',
    '야외무대', '강변광장', '잔디광장', '운동장', '체육관', '실내체육관', '다목적체육관', '국민체육센터', '종합운동장',
    '풋살장', '배드민턴장', '테니스장', '농구장', '족구장', '탁구장', '볼링장', '수영장', '헬스장', '체력단련실',
    '강습장', '강의실', '강의장', '교육장', '도서관', '작은도서관', '공연장',
    '주차장', '주민자치센터', '복지회관', '노인복지관', '청소년수련관', '청소년센터', '어린이집',
    '문화센터', '종합문화센터', '학교시설', '대강당', '회의장', '발표장', '연습실', '다목적실'
]

# publicFacilities.csv 처리
def clean_public_facilities():
    input_csv = os.path.join(BASE_DIR, 'precsv', 'publicFacilities.csv')
    output_dir = os.path.join(BASE_DIR, 'csv')
    output_csv = os.path.join(output_dir, 'publicFacilities.csv')

    # 데이터 읽기
    df = pd.read_csv(input_csv, encoding='euc-kr')
    original_df = df.copy()

    # '기타(무언가)' 형태 처리
    def fix_etc_pattern(row):
        if str(row['개방시설유형구분']).startswith('기타(') and str(row['개방시설유형구분']).endswith(')'):
            inside = re.search(r'기타\((.*?)\)', row['개방시설유형구분'])
            if inside:
                return inside.group(1)
        return row['개방시설유형구분']

    df['개방시설유형구분'] = df.apply(fix_etc_pattern, axis=1)

    # 공공시설명에서 매칭
    def fix_facility_type(row):
        if row['개방시설유형구분'] == '기타':
            facility_name = str(row['개방시설명']).lower()
            for t in target_types:
                if t.lower() in facility_name:
                    return t
        return row['개방시설유형구분']

    df['개방시설유형구분'] = df.apply(fix_facility_type, axis=1)

    # 수정된 행 수 출력
    modified_count = (original_df['개방시설유형구분'] != df['개방시설유형구분']).sum()
    print(f"[publicFacilities] 수정된 행 수: {modified_count}건")

    # 저장할 디렉터리 생성
    os.makedirs(output_dir, exist_ok=True)

    # 파일 저장
    df.to_csv(output_csv, index=False, encoding='euc-kr')
    print(f"[publicFacilities] CSV 저장 완료: {output_csv}")

# outingFacilities.csv 처리
def clean_outing_facilities():
    input_csv = os.path.join(BASE_DIR, 'precsv', 'outingFacilities.csv')
    output_dir = os.path.join(BASE_DIR, 'csv')
    output_csv = os.path.join(output_dir, 'outingFacilities.csv')

    # 데이터 읽기
    df = pd.read_csv(input_csv, encoding='utf-8')

    # '자연'만 남기기
    df_nature = df[df['LCLAS_NM'] == '자연']

    # 결과 출력
    print(f"[outingFacilities] 원래 데이터 수: {len(df)}개")
    print(f"[outingFacilities] '자연'만 남긴 후 데이터 수: {len(df_nature)}개")

    # 저장할 디렉터리 생성
    os.makedirs(output_dir, exist_ok=True)

    # 파일 저장
    df_nature.to_csv(output_csv, index=False, encoding='euc-kr')
    print(f"[outingFacilities] 자연만 남긴 CSV 저장 완료: {output_csv}")

# 메인 실행


def clean_hospital_facilities():
    input_csv=os.path.join(BASE_DIR,'precsv','hospitalFacilities.csv')
    output_dir=os.path.join(BASE_DIR,'csv')
    output_csv=os.path.join(output_dir,'hospitalFacilities.csv')
    df=pd.read_csv(input_csv, encoding='euc-kr')
    df_open=df[df['영업상태구분코드']==1]
    os.makedirs(output_dir,exist_ok=True)
    df_open.to_csv(output_csv,index=False,encoding='euc-kr')
    print(f"[outingFacilities] 운영중만 남긴 CSV 저장 완료: {output_csv}")
if __name__ == "__main__":
    clean_hospital_facilities()