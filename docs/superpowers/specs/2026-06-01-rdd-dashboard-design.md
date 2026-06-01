# 설계 명세서: 도로 손상 데이터셋(RDD) 대시보드

## 1. 개요
도로 손상 데이터셋(RDD) 분석 결과를 시각화하기 위한 웹 기반 대시보드입니다. Apache Spark로 처리된 데이터는 관계형 데이터베이스에 저장되며, Spring Boot 백엔드가 REST API를 통해 React 프론트엔드로 데이터를 제공합니다.

## 2. 목표
- 차트를 사용하여 도로 손상 유형별 분포 시각화.
- 대화형 구글 지도에 정확한 손상 위치 표시.
- 기록된 모든 손상 데이터에 대한 검색 가능한 목록 제공.

## 3. 기술 스택
- **프론트엔드**: React (TypeScript), Tailwind CSS, Recharts, Google Maps JavaScript API.
- **백엔드**: Java, Spring Boot 3.x, Spring Data JPA.
- **데이터베이스**: H2 (개발/테스트용), MySQL (운영용).
- **빌드 도구**: Maven/Gradle (백엔드), npm/yarn (프론트엔드).

## 4. 데이터 모델
### RoadDamage 엔티티
| 필드명 | 타입 | 설명 |
| :--- | :--- | :--- |
| id | Long | 기본 키 (자동 증가) |
| damageType | String | 손상 유형 (예: D00, D10, D20, D40) |
| latitude | Double | 손상 위치의 GPS 위도 |
| longitude | Double | 손상 위치의 GPS 경도 |
| imageX | Double | 이미지 내 파손 X 좌표 |
| imageY | Double | 이미지 내 파손 Y 좌표 |
| capturedAt | LocalDateTime | 손상 데이터가 기록된 시간 |

## 5. 시스템 아키텍처
1.  **데이터베이스**: Spark에서 전처리된 데이터를 저장.
2.  **Spring Boot 백엔드**:
    - 데이터베이스 접근을 위한 Repository 레이어.
    - 비즈니스 로직을 위한 Service 레이어.
    - REST 컨트롤러 제공 엔드포인트:
        - `GET /api/damages`: 모든 손상 기록 반환.
        - `GET /api/damages/stats`: 손상 유형별 통계 반환.
3.  **React 프론트엔드**:
    - 여러 컴포넌트로 구성된 대시보드 페이지.
    - `StatsComponent`: `/api/damages/stats`를 호출하여 차트 렌더링.
    - `MapComponent`: `/api/damages`를 호출하여 구글 지도에 마커 표시.
    - `ListComponent`: 테이블 형식으로 손상 상세 정보 표시.

## 6. UI/UX 디자인
- **헤더**: 프로젝트 제목 및 내비게이션.
- **메인 레이아웃**: 그리드 기반 대시보드.
    - 상단: 요약 카드 (전체 건수, 가장 빈번한 유형 등).
    - 중앙: 왼쪽 차트, 오른쪽 구글 지도.
    - 하단: 페이지네이션이 포함된 데이터 테이블.

## 7. 구현 전략
1.  **1단계**: Spring Boot 및 H2 백엔드 설정. 엔티티, 리포지토리 및 초기 REST API 생성.
2.  **2단계**: React 프론트엔드 설정. Tailwind CSS 통합 및 기본 라우팅.
3.  **3단계**: Recharts 및 구글 지도 통합.
4.  **4단계**: MySQL 전환 및 설정.
