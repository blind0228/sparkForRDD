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

#### 2.2 도로 손상 페이징 조회
- **Endpoint**: `GET /api/damages`
- **설명**: 조건에 맞는 도로 손상 목록을 페이징 및 필터링하여 반환합니다.
- **Request Parameters**:
    - `page` (optional): 페이지 번호 (기본값 0)
    - `size` (optional): 한 페이지당 항목 수 (기본값 10)
    - `damageType` (optional): 손상 유형 필터 (예: D00, ALL)
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `Page<RoadDamage>` (Spring Data Page 객체)
        ```json
        {
          "content": [
            {
              "id": 1,
              "damageType": "D00",
              "latitude": 37.123456,
              "longitude": 127.123456,
              "capturedAt": "2026-06-01T15:30:00"
            }
          ],
          "pageable": { ... },
          "totalPages": 5,
          "totalElements": 50,
          "size": 10,
          "number": 0
        }
        ```

#### 2.3 지도 영역 데이터 조회
- **Endpoint**: `GET /api/damages/map`
- **설명**: 지도의 현재 화면 위경도 영역(Bounding Box) 내에 포함되는 데이터만 조회합니다.
- **Request Parameters**:
    - `minLat`, `maxLat`: 위도 최소/최대값
    - `minLng`, `maxLng`: 경도 최소/최대값
    - `damageType` (optional): 손상 유형 필터
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<RoadDamage>`

#### 2.4 손상 유형별 통계 조회
- **Endpoint**: `GET /api/damages/stats`
- **설명**: 도로 손상 유형(damageType)별로 집계된 건수를 반환합니다.
- **Request**: 없음
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<DamageStatsDto>`

#### 2.5 도로 손상 정보 등록
- **Endpoint**: `POST /api/damages`
- **설명**: 새로운 도로 손상 정보를 등록합니다.
- **Request Body**:
    ```json
    {
      "damageType": "D20",
      "latitude": 37.525,
      "longitude": 126.924,
      "imageX": 320.5,
      "imageY": 240.0
    }
    ```
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: 등록된 `RoadDamage` 객체

#### 2.6 도로 손상 정보 삭제
- **Endpoint**: `DELETE /api/damages/{id}`
- **설명**: ID를 기반으로 특정 도로 손상 정보를 삭제합니다.
- **Response**:
    - **Status Code**: `200 OK`

---

### [User API]

#### 2.7 회원가입
- **Endpoint**: `POST /api/users/register`
- **설명**: 신규 사용자를 등록합니다.
- **Request Body**: `UserRegisterRequestDto`
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "name": "홍길동",
      "dept": "도로보수실무팀"
    }
    ```
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `UserResponseDto` (비밀번호 제외)

#### 2.8 사용자 목록 조회
- **Endpoint**: `GET /api/users`
- **설명**: 시스템에 등록된 모든 사용자 정보를 반환합니다.
- **Response**:
    - **Status Code**: `200 OK`
    - **Body**: `List<UserResponseDto>`

#### 2.9 사용자 삭제
- **Endpoint**: `DELETE /api/users/{id}`
- **설명**: ID를 기반으로 특정 사용자를 삭제합니다.
- **Response**:
    - **Status Code**: `200 OK`

---

### [Authentication API]

#### 2.10 로그인
- **Endpoint**: `POST /api/login`
- **설명**: 세션 기반 로그인을 수행합니다.
- **Request (Form-Data)**:
    - `username`: 이메일 (예: admin@example.com)
    - `password`: 비밀번호 (예: 1234)
- **Response**:
    - **Status Code**: `200 OK` (성공), `401 Unauthorized` (실패)

#### 2.7 로그아웃
- **Endpoint**: `POST /api/logout`
- **설명**: 현재 세션을 종료합니다.
- **Response**:
    - **Status Code**: `200 OK`

---

## 3. 데이터 모델

### RoadDamage
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| id | Long | 고유 식별자 |
| damageType | String | 손상 유형 (D00: 종방향 균열, D10: 횡방향 균열 등) |
| latitude | Double | GPS 위도 |
| longitude | Double | GPS 경도 |
| imageX | Double | 이미지 내 파손 X 좌표 |
| imageY | Double | 이미지 내 파손 Y 좌표 |
| capturedAt | LocalDateTime | 기록 일시 |

### DamageStatsDto
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| damageType | String | 손상 유형 |
| count | Long | 해당 유형의 총 건수 |
