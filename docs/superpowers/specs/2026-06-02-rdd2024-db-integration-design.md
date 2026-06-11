# RDD2024 데이터베이스 통합 디자인 (RDD2024 Database Integration Design)

본 문서는 Spark를 통해 전처리된 RDD2024 도로 손상 데이터를 백엔드 시스템에 통합하기 위한 상세 설계서입니다. 기존의 H2 기반 로컬 개발 환경을 Render PostgreSQL 운영 환경으로 전환하고, 실제 테이블 구조에 맞게 엔티티와 API를 재정의합니다.

---

## 1. 개요 (Overview)

*   **목적**: 실제 RDD2024 데이터셋이 저장된 외부 PostgreSQL DB와 연동하여 신뢰성 있는 데이터 제공.
*   **핵심 변경 사항**:
    *   데이터베이스: H2 (In-memory) -> PostgreSQL (Render)
    *   테이블 구조: 단일 `road_damage` 테이블 -> `road_damage_markers`, `road_damage_labels` 이원화
    *   보안: 접속 정보를 `.env` 파일로 분리하여 관리.

---

## 2. 데이터베이스 및 보안 (Database & Security)

### 2.1. 접속 정보 관리
*   **환경 변수**: `.env` 파일을 프로젝트 루트에 생성하여 DB 접속 정보를 관리합니다.
*   **Spring 연동**: `application.yml`에서 환경 변수를 참조하여 `DataSource`를 설정합니다.
*   **보안**: `.env` 및 `application.yml`의 민감한 정보는 Git 추적에서 제외하거나 마스킹 처리합니다.

### 2.2. JPA 설정
*   **Dialect**: `org.hibernate.dialect.PostgreSQLDialect` 사용.
*   **DDL-Auto**: `validate` 또는 `none`. (운영 DB의 데이터를 보존하기 위해 스키마 자동 변경을 금지합니다.)

---

## 3. 엔티티 설계 (Entity Design)

### 3.1. RoadDamageMarker (road_damage_markers)
지도상의 마커를 표시하기 위한 요약 데이터입니다.
*   `id` (Long): PK
*   `dataBatch` (String): 데이터 배치 (예: original)
*   `country` (String): 국가명
*   `fileName` (String): 원본 라벨 파일명
*   `imageFileName` (String): 이미지 파일명
*   `imageUrl` (String): 프론트엔드 이미지 경로
*   `latitude` (Double): 가상 위도
*   `longitude` (Double): 가상 경도
*   `totalDamageCount` (Integer): 이미지 내 총 손상 수
*   `createdAt` (LocalDateTime): 저장 시간

### 3.2. RoadDamageLabel (road_damage_labels)
각 마커 클릭 시 보여줄 상세 손상(Bounding Box) 데이터입니다.
*   `id` (Long): PK
*   `dataBatch`, `country`, `fileName` 등 공통 필드
*   `damageCode` (String): 손상 코드 (D00~D90)
*   `damageName` (String): 손상 유형 명칭
*   `classId` (Integer): YOLO 클래스 ID
*   `xCenter`, `yCenter`, `bboxWidth`, `bboxHeight` (Double): 바운딩 박스 좌표/크기 (0~1 상대값)
*   `latitude`, `longitude`: 가상 위경도 (마커와 동일)

---

## 4. API 엔드포인트 설계 (API Design)

### 4.1. 마커 API (`/api/damages/markers`)
*   `GET /`: 전체 마커 목록 조회.
*   `GET /?country={country}`: 특정 국가 필터링 조회.

### 4.2. 라벨 API (`/api/damages/labels`)
*   `GET /file/{fileName}`: 특정 파일에 속한 모든 상세 라벨 조회.

### 4.3. 통계 API (`/api/damages/stats`)
*   `GET /countries`: 국가별 마커/라벨 분포 통계.
*   `GET /types`: 국가별/손상코드별 상세 집계.

---

## 5. 프론트엔드 연동 고려사항

*   **이미지 렌더링**: `image_url` 또는 `image_file_name`을 활용하여 `/images/...` 경로로 접근.
*   **가상 위치 안내**: 대시보드 하단에 "시각화용 가상 위치 데이터"임을 명시하는 가이드를 추가하여 사용자 혼선을 방지합니다.

---

## 6. 승인 및 검토

*   **설계 승인**: 2026-06-02 (User approved via terminal)
*   **작성자**: Gemini CLI (Senior Software Engineer)
