# API 명세서 (API Specification) - RDD2024 통합 버전

## 1. 개요
본 문서는 RDD2024 데이터베이스 통합 후 제공되는 REST API 명세서입니다. 기존의 단일 데이터 구조에서 마커(Marker)와 상세 라벨(Label)로 분리된 구조를 따릅니다.

**Base URL**: `http://localhost:8080`

---

## 2. API 목록

### [Road Damage API]

#### 2.1 지도 마커 목록 조회
- **Endpoint**: `GET /api/damages/markers`
- **설명**: 지도에 표시할 마커 목록을 반환합니다. 국가별 필터링이 가능합니다.
- **Request Parameters**:
    - `country` (optional): 국가명 필터 (예: Japan, India, China)
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<RoadDamageMarker>`
        ```json
        [
          {
            "id": 1,
            "dataBatch": "original",
            "country": "Japan",
            "fileName": "Japan_000001.txt",
            "imageFileName": "Japan_000001.jpg",
            "imageUrl": "/images/Japan_000001.jpg",
            "latitude": 35.6895,
            "longitude": 139.6917,
            "totalDamageCount": 3,
            "createdAt": "2026-06-02T10:00:00"
          }
        ]
        ```

#### 2.2 특정 파일 상세 라벨 조회
- **Endpoint**: `GET /api/damages/labels/file/{fileName}`
- **설명**: 마커를 클릭했을 때, 해당 이미지 파일에 포함된 모든 상세 손상 라벨(Bounding Box)을 조회합니다.
- **Request Parameters**:
    - `fileName` (path): 원본 라벨 파일명 (예: Japan_000001.txt)
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<RoadDamageLabel>`
        ```json
        [
          {
            "id": 101,
            "damageCode": "D00",
            "damageName": "Longitudinal cracks",
            "xCenter": 0.5,
            "yCenter": 0.4,
            "bboxWidth": 0.1,
            "bboxHeight": 0.2,
            "latitude": 35.6895,
            "longitude": 139.6917
          }
        ]
        ```

#### 2.3 손상 유형별 통계 조회
- **Endpoint**: `GET /api/damages/stats/types`
- **설명**: 전체 데이터의 손상 유형별 집계 건수를 반환합니다.
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<DamageStatsDto>`
        ```json
        [
          {
            "damageType": "D00",
            "damageName": "Longitudinal cracks",
            "count": 1540
          }
        ]
        ```

#### 2.4 국가별 통계 조회
- **Endpoint**: `GET /api/damages/stats/countries`
- **설명**: 국가별로 등록된 데이터 건수를 반환합니다.
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<CountryStatsDto>`

---

## 3. 데이터 모델

### RoadDamageMarker
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| id | Long | 고유 식별자 |
| country | String | 국가 정보 |
| fileName | String | 상세 라벨 조회용 키 |
| latitude | Double | 시각화용 가상 위도 |
| longitude | Double | 시각화용 가상 경도 |
| totalDamageCount | Integer | 이미지 내 총 손상 수 |

### RoadDamageLabel
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| damageCode | String | 손상 코드 (D00~D90) |
| damageName | String | 손상 유형명 |
| xCenter, yCenter | Double | YOLO 상대 좌표 (0~1) |
| bboxWidth, bboxHeight | Double | 바운딩 박스 크기 (0~1) |

---

## 4. 주의 사항
- **가상 위치 데이터**: 본 시스템의 `latitude`, `longitude`는 실제 촬영 위치가 아닌 국가별 시각화를 위해 생성된 **가상 위치 데이터**입니다.
- **이미지 표시**: 프론트엔드에서는 `imageFileName`을 사용하여 `/images/${imageFileName}` 경로로 이미지를 호출하십시오.
