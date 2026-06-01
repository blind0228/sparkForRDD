# API 명세서 (API Specification)

## 1. 개요
본 문서는 RDD 대시보드 백엔드 시스템에서 제공하는 REST API에 대한 상세 명세서입니다.

**Base URL**: `http://localhost:8080`

---

## 2. API 목록

### [Health API]

#### 2.1 서버 상태 확인
- **Endpoint**: `GET /api/health`
- **설명**: 서버가 정상적으로 작동 중인지 확인합니다.
- **Request**: 없음
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `"OK"` (String)

---

### [Road Damage API]

#### 2.2 전체 손상 목록 조회
- **Endpoint**: `GET /api/damages`
- **설명**: 데이터베이스에 저장된 모든 도로 손상 정보를 반환합니다.
- **Request**: 없음
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<RoadDamage>`
        ```json
        [
          {
            "id": 1,
            "damageType": "D00",
            "latitude": 37.123456,
            "longitude": 127.123456,
            "capturedAt": "2026-06-01T15:30:00"
          }
        ]
        ```

#### 2.3 손상 유형별 통계 조회
- **Endpoint**: `GET /api/damages/stats`
- **설명**: 도로 손상 유형(damageType)별로 집계된 건수를 반환합니다.
- **Request**: 없음
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<DamageStatsDto>`
        ```json
        [
          {
            "damageType": "D00",
            "count": 15
          },
          {
            "damageType": "D10",
            "count": 7
          }
        ]
        ```

---

## 3. 데이터 모델

### RoadDamage
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| id | Long | 고유 식별자 |
| damageType | String | 손상 유형 (D00: 종방향 균열, D10: 횡방향 균열 등) |
| latitude | Double | GPS 위도 |
| longitude | Double | GPS 경도 |
| capturedAt | LocalDateTime | 기록 일시 |

### DamageStatsDto
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| damageType | String | 손상 유형 |
| count | Long | 해당 유형의 총 건수 |
