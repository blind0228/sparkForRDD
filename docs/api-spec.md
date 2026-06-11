# API 명세서 (API Specification) - RDD2024 통합 및 최적화 버전

## 1. 개요
본 문서는 RDD2024 데이터베이스 통합 및 PostGIS 성능 최적화 후 제공되는 REST API 명세서입니다.

**Base URL**: `http://localhost:8080`

---

## 2. API 목록

### [Road Damage API]

#### 2.1 지도 마커 목록 조회
- **Endpoint**: `GET /api/damages/markers`
- **설명**: 지도에 표시할 마커 목록을 반환합니다. 국가별 필터링 또는 공간 영역(BBox) 필터링이 가능합니다.
- **Request Parameters**:
    - `country` (optional): 국가명 필터
    - `minLat`, `minLng`, `maxLat`, `maxLng` (optional): 조회할 사각형 영역 좌표 (네 가지 모두 입력 시 공간 필터링 활성화)
    - `limit` (optional, default: 1000): 반환할 최대 마커 개수
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

#### 2.2 지도 클러스터 조회
- **Endpoint**: `GET /api/damages/clusters`
- **설명**: 영역(BBox) 내의 마커들을 그리드 단위로 집계하여 클러스터링된 데이터를 반환합니다. 대규모 데이터 시각화에 최적화되어 있습니다.
- **Request Parameters**:
    - `minLat`, `minLng`, `maxLat`, `maxLng` (required): 조회할 사각형 영역 좌표
    - `gridSize` (optional, default: 0.1): 집계할 그리드 크기 (단위: 도)
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<MarkerClusterDto>`
        ```json
        [
          {
            "latitude": 37.53,
            "longitude": 126.98,
            "count": 5240
          }
        ]
        ```

#### 2.3 특정 파일 상세 라벨 조회
- **Endpoint**: `GET /api/damages/labels/file/{fileName}`
- **설명**: 마커를 클릭했을 때, 해당 이미지 파일에 포함된 모든 상세 손상 라벨(Bounding Box)을 조회합니다.
- **Request Parameters**:
    - `fileName` (path): 원본 라벨 파일명 (예: Japan_000001.txt)
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<RoadDamageLabel>`

#### 2.4 손상 유형별 통계 조회
- **Endpoint**: `GET /api/damages/stats/types`
- **설명**: 전체 데이터의 손상 유형별 집계 건수를 반환합니다.
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<DamageStatsDto>`

#### 2.5 국가별 통계 조회
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
| latitude | Double | 위도 |
| longitude | Double | 경도 |
| totalDamageCount | Integer | 이미지 내 총 손상 수 |

### MarkerClusterDto
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| latitude | Double | 클러스터 중심 위도 |
| longitude | Double | 클러스터 중심 경도 |
| count | Long | 해당 클러스터 내 데이터 건수 |

---

## 4. 주의 사항
- **PostGIS 기반 조회**: 공간 쿼리는 DB의 `geom` 컬럼과 공간 인덱스를 활용하여 매우 빠르게 수행됩니다.
- **이미지 호출**: `/images/${imageFileName}` 경로를 사용하십시오.
