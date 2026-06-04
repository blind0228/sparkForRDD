# API 명세서 (API Specification) - RDD AI Intelligence Edition

## 1. 개요
본 문서는 실시간 도로 손상 감지 및 AI 분석 기능을 포함한 통합 관리 시스템의 REST API 명세서입니다.

**Base URL**: `http://localhost:8080`

---

## 2. 핵심 API 목록

### [Road Damage Data API]

#### 2.1 마커 목록 조회 (공간 필터링 및 페이징)
- **Endpoint**: `GET /api/damages`
- **설명**: 관리자 및 목록 페이지용 페이징 데이터 조회.
- **Query Parameters**:
    - `page` (default: 0): 페이지 번호
    - `size` (default: 10): 페이지 당 건수
    - `country` (optional): 국가 필터
- **Response**: `Page<RoadDamageMarker>` (Spring Data Page 객체)

#### 2.2 실시간 지도 데이터 조회
- **Endpoint**: `GET /api/damages/markers`
- **설명**: 지도 뷰포트 영역 내의 마커 조회.
- **Query Parameters**:
    - `minLat`, `minLng`, `maxLat`, `maxLng`: 뷰포트 좌표 (공간 필터링)
    - `limit` (default: 1000): 최대 반환 건수

#### 2.3 고성능 클러스터 조회
- **Endpoint**: `GET /api/damages/clusters`
- **설명**: 줌 레벨에 따른 서버 사이드 그리드 집계 데이터 조회.
- **Query Parameters**:
    - `gridSize` (default: 0.1): 집계 정밀도

#### 2.4 AI 분석 전략 보고서 생성
- **Endpoint**: `GET /api/damages/report/ai`
- **설명**: 현재 통계 데이터를 기반으로 AI(OpenAI/Gemini)가 분석한 전문 PDF 보고서를 생성하여 다운로드합니다.
- **Response**: `application/pdf` 파일

---

## 3. 통계 및 라벨 API

#### 3.1 상세 라벨 조회
- **Endpoint**: `GET /api/damages/labels/file/{fileName}`
- **설명**: 특정 마커의 원본 이미지 내 상세 손상 위치(BBox) 목록 조회.

#### 3.2 유형별/국가별 통계
- **Endpoints**: 
    - `GET /api/damages/stats/types`
    - `GET /api/damages/stats/countries`
    - `GET /api/damages/stats/daily`: 일별 데이터 발생 추이 조회 (분석 탭용)

---

## 4. 데이터 모델

### RoadDamageMarker (주요 필드)
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| id | Long | 고유 ID |
| country | String | 발생 국가 |
| latitude | Double | 위도 |
| longitude | Double | 경도 |
| totalDamageCount | Integer | 감지된 총 손상 수 |
| createdAt | LocalDateTime | 데이터 생성 시간 |

---

## 5. 주의 사항
- **보안**: `/api/damages/**` 경로는 현재 조회가 허용되어 있으나, 관리 기능은 인증이 필요합니다.
- **성능**: 대량 데이터 조회 시 반드시 `markers` 또는 `clusters` 엔드포인트를 사용하고 뷰포트 파라미터를 포함하십시오.
