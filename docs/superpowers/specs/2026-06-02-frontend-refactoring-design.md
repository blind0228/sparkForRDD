# RDD2024 프론트엔드 리팩토링 디자인 (RDD2024 Frontend Refactoring Design)

본 문서는 백엔드의 RDD2024 데이터베이스 통합에 따라 프론트엔드 시스템을 리팩토링하기 위한 상세 설계서입니다. 단일 데이터 구조에서 마커-라벨 이원화 구조로 전환하고, 사용자 경험(UX)을 개선하는 것을 목적으로 합니다.

---

## 1. 개요 (Overview)

*   **목적**: 새로운 API 구조(`markers`, `labels`) 대응 및 상세 손상 정보 시각화 강화.
*   **핵심 변경 사항**:
    *   **데이터 모델**: `RoadDamage` 인터페이스 삭제 및 `RoadDamageMarker`, `RoadDamageLabel` 도입.
    *   **지도 기능**: 마커 클릭 시 중앙 모달을 통해 상세 라벨(바운딩 박스) 및 이미지 표시.
    *   **대시보드**: 새로운 통계 API 데이터 구조 대응.

---

## 2. 데이터 타입 및 상태 관리 (Types & State)

### 2.1. 새로운 인터페이스 정의
기존 `frontend/src/pages/Dashboard.tsx` 등에 분산된 타입을 통합 관리합니다.
*   `RoadDamageMarker`: `id`, `country`, `fileName`, `imageFileName`, `latitude`, `longitude`, `totalDamageCount` 등 포함.
*   `RoadDamageLabel`: `damageCode`, `damageName`, `xCenter`, `yCenter`, `bboxWidth`, `bboxHeight` 등 포함.
*   `DamageStats`: `damageType`, `damageName`, `count` 포함.

### 2.2. 글로벌 상태 관리
*   `App.tsx`에서 관리하던 `damages` 상태를 `markers`로 변경합니다.
*   필요 시 상세 라벨 데이터를 위한 `selectedLabels` 상태를 추가합니다.

---

## 3. 컴포넌트 리팩토링 상세 (Component Refactoring)

### 3.1. Dashboard.tsx (대시보드)
*   **통계 연동**: `/api/damages/stats/types` 및 `/api/damages/stats/countries` 호출부 수정.
*   **최근 기록**: `RoadDamageMarker` 데이터를 기반으로 최신 발견 리스트 렌더링.
*   **차트**: `DamageStatsDto`의 `damageName`을 라벨로 사용하도록 차트 로직 수정.

### 3.2. MapMode.tsx (관제 지도)
*   **마커 로딩**: `/api/damages/markers` API를 사용하여 지도에 핀 표시.
*   **인터랙션**: 마커 클릭 시 `fileName`을 기반으로 상세 데이터를 호출하고 모달을 엽니다.

### 3.3. 상세 정보 모달 (Detail Modal - 신규/확장)
*   **중앙 모달**: 지도의 마커 클릭 시 화면 중앙에 오버레이.
*   **이미지 뷰어**: `imageUrl`을 통해 원본 이미지를 표시하고, `RoadDamageLabel`의 상대 좌표를 활용하여 이미지 위에 **바운딩 박스**를 오버레이로 그려줍니다.
*   **라벨 리스트**: 이미지 우측에 감지된 모든 손상 내역(코드, 명칭)을 리스트 형태로 표시.

---

## 4. API 호출 구조 변경

| 기존 엔드포인트 | 변경된 엔드포인트 | 비고 |
| :--- | :--- | :--- |
| `GET /api/damages` | `GET /api/damages/markers` | 페이징 미지원(초기), 전체 마커 조회 |
| `GET /api/damages/map` | `GET /api/damages/markers` | (추후 위경도 필터 추가 검토) |
| `GET /api/damages/stats` | `GET /api/damages/stats/types` | DTO 구조 변경 대응 |
| N/A | `GET /api/damages/labels/file/{fileName}` | **[신규]** 마커 클릭 시 호출 |

---

## 5. UI/UX 개선 및 안내사항

*   **가상 위치 안내**: 대시보드 및 지도의 툴팁/푸터에 "본 위치는 시각화를 위한 가상 위치 데이터입니다" 문구 노출.
*   **이미지 로딩**: `public/images/` 폴더의 리소스를 활용하도록 경로 설정.

---

## 6. 승인 및 검토

*   **설계 승인**: 2026-06-02 (User approved via terminal)
*   **작성자**: Gemini CLI (Senior Software Engineer)
