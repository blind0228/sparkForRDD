# Road Damage Detection API Specification

본 문서는 도로 손상 통합 관리 시스템의 백엔드 API 규격을 정의합니다.

---

## 1. 공통 사항 (Common)
- **Base URL**: `http://localhost:8080/api`
- **인증**: `/api/login`을 통한 세션 기반 인증 (일부 공개 API 제외)

---

## 2. 도로 손상 데이터 API (Road Damage)

### 2.1. 마커 목록 조회 (페이징)
- **Endpoint**: `GET /api/damages`
- **Description**: 전체 또는 국가별 마커 목록을 페이징하여 조회합니다.
- **Parameters**:
  - `page` (int, default=0): 페이지 번호
  - `size` (int, default=10): 페이지 크기
  - `country` (string, optional): 필터링할 국가명
  - `sort` (string, optional): 정렬 기준 (예: `id,desc`, `latitude,asc`)
- **Response**: `Page<RoadDamageMarker>`

### 2.2. 영역 내 마커 조회
- **Endpoint**: `GET /api/damages/markers`
- **Description**: 현재 지도 뷰포트 내의 마커들을 조회하며, **바다 위 데이터는 GeoTools 필터링을 거쳐 제외**됩니다.
- **Parameters**:
  - `minLat`, `minLng`, `maxLat`, `maxLng` (double): 영역 좌표
  - `limit` (int, default=1000): 최대 반환 개수
- **Response**: `List<RoadDamageMarker>` (변환된 `imageUrl` 포함)

### 2.3. 영역 내 클러스터 조회
- **Endpoint**: `GET /api/damages/clusters`
- **Description**: 줌 레벨이 낮을 때 데이터를 그리드 단위로 집계하여 반환합니다.
- **Parameters**:
  - `gridSize` (double): 집계 그리드 크기
  - `minLat`, `minLng`, `maxLat`, `maxLng`: 영역 좌표
- **Response**: `List<MarkerClusterDto>`

### 2.4. 파일 상세 라벨 조회
- **Endpoint**: `GET /api/damages/labels/file/{fileName}`
- **Description**: 이미지 내 손상 부위(BBox) 정보를 조회합니다.
- **Response**: `List<RoadDamageLabel>` (xCenter, yCenter 등 정규화 좌표 포함)

### 2.5. 공간 필터링 상태 확인
- **Endpoint**: `GET /api/damages/spatial-status`
- **Description**: GeoTools 엔진의 초기화 상태 및 로드된 Shapefile 데이터를 확인합니다.
- **Response**: `{ "initialized": boolean, "polygonCount": int }`

---

## 3. 정적 리소스 API (Static Resources)

### 3.1. 로컬 이미지 스트리밍
- **Endpoint**: `GET /images/**`
- **Description**: `/Users/blind/N-RDD2024-2/TestDataSet/` 경로의 원본 이미지를 직접 스트리밍합니다.
- **Security**: 인증 없이 접근 가능하도록 허용되어 있습니다.
- **URL 규칙**: `/images/{countryDir}/{split}/images/{fileName}.jpg`
