# 도로 손상 통합 관리 시스템 (Road Damage Detection & Management System)

본 프로젝트는 Apache Spark로 전처리된 도로 손상 데이터셋(RDD)을 기반으로, 실시간 도로 손상 현황을 모니터링하고 관리할 수 있는 통합 대시보드 시스템입니다.

## 🚀 주요 기능

### 1. 실시간 대시보드
- **통계 요약**: 전체 손상 건수, 고위험 구역(D40) 수, 최다 발생 유형 등 핵심 지표 요약.
- **유형별 분포**: Recharts를 활용한 도로 손상 유형(D00, D10, D20, D40)별 분포 시각화.
- **최근 보고**: 최신 발견된 도로 손상 내역 실시간 리스트.

### 2. GIS 관제 지도
- **위치 시각화**: 데이터베이스의 GPS 좌표를 기반으로 지도 위에 손상 위치 마커 표시.
- **필터링**: 특정 손상 유형별로 지도 마커를 필터링하여 확인 가능.
- **상세 정보**: 마커 클릭 시 해당 위치의 위/경도 및 감지 시간 확인.

### 3. 데이터 및 권한 관리
- **로그인/보안**: 세션 기반 인증(Spring Security) 적용 (관리자 계정: `admin@example.com` / `1234`).
- **데이터 관리**: 관리자 권한으로 도로 손상 정보 수동 등록 및 삭제 가능.
- **사용자 관리**: 시스템 접근 가능 인원 관리 및 권한 설정.

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 3.3.0
- **Language**: Java 17
- **Security**: Spring Security (Session-based Auth)
- **Data**: Spring Data JPA, H2 (Dev/Test), MySQL (Prod Ready)
- **API Docs**: SpringDoc OpenAPI (Swagger UI)

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router DOM

## 📖 문서 가이드

- [API 명세서](./docs/api-spec.md): 백엔드 REST API 상세 정의.
- [디자인 가이드](./DESIGN.md): Stitch MCP 기반의 UI/UX 설계 규칙.
- [설계 명세서](./docs/superpowers/specs/2026-06-01-rdd-dashboard-design.md): 시스템 아키텍처 및 데이터 모델 설계.
- [에이전트 헌법](./AGENTS.md): AI 에이전트의 작업 원칙 및 가이드라인.

## 🏃 실행 방법

### Backend
```bash
cd backend
./gradlew bootRun
```
- Swagger 접속: `http://localhost:8080/swagger-ui.html`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
- 기본 접속: `http://localhost:5173`

## 📝 변경 이력 (Changelog)
상세한 업데이트 내역은 [CHANGELOG.md](./CHANGELOG.md)를 참조하십시오.
