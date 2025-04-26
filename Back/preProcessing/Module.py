import pandas as pd
# 주요 유형 키워드 (단순화된 목록)
def preProcessFacilities():
    keywords = [
        '다목적실', '체육관', '회의실', '강의실', '강당', '풋살경기장', '테니스장', '족구장',
        '축구장', '야구장', '배드민턴장', '전시실', '농구장', '골프장', '캠핑장', '교육실',
        '배구장', '인라인장', '주민사랑방', '촬영', '수영장', '휴양림', '동아리실', '공연장'
    ]

    file_path = './csv/publicFacilities.csv'
    df = pd.read_csv(file_path, encoding='EUC-KR')

    # 복사본 생성
    df_updated = df.copy()

    # '기타'인 경우에 대해 개방시설명에 키워드가 포함되면 유형 수정
    def update_type(row):
        if row['개방시설유형구분'] == '기타':
            for keyword in keywords:
                if keyword in row['개방시설명']:
                    return keyword
        return row['개방시설유형구분']

    df_updated['개방시설유형구분'] = df_updated.apply(update_type, axis=1)

    # 변경된 데이터 저장
    output_path = './csv/publicFacilities.csv'
    df_updated.to_csv(output_path, index=False, encoding='EUC-KR')

    print("개방시설 기타 구분 변환 완료")