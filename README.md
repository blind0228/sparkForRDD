# 도로 손상 통합 관리 시스템 (Road Damage Detection & Management System)

본 프로젝트는 Apache Spark로 전처리된 도로 손상 데이터셋(RDD)을 기반으로, 실시간 도로 손상 현황을 모니터링하고 관리할 수 있는 통합 대시보드 시스템입니다.

## 🚀 주요 기능

### 1. 실시간 대시보드
- **통계 요약**: 전체 손상 건수, 고위험 구역(D40) 수, 최다 발생 유형 등 핵심 지표 요약.
- **유형별 분포**: Recharts를 활용한 도로 손상 유형(D00, D10, D20, D40)별 분포 시각화.
- **최근 보고**: 최신 발견된 도로 손상 내역 실시간 리스트.

### 2. GIS 관제 지도
- **위치 시각화**: PostgreSQL 데이터베이스의 GPS 좌표를 기반으로 지도 위에 손상 위치 마커 표시.
- **클러스터링**: 대량의 마커를 효율적으로 렌더링하기 위한 마커 클러스터링 적용.
- **상세 정보 (GIS Modal)**: 마커 클릭 시 나타나는 상세 모달에서 원본 이미지와 함께 YOLO 형식의 바운딩 박스(Bounding Box) 오버레이를 통해 정확한 손상 위치 및 유형 확인 가능.
- **필터링**: 특정 손상 유형별로 지도 마커를 필터링하여 확인 가능.

### 3. 데이터 및 권한 관리
- **로그인/보안**: 세션 기반 인증(Spring Security) 적용 (관리자 계정: `admin@example.com` / `1234`).
- **데이터 관리**: 관리자 권한으로 도로 손상 정보 수동 등록 및 삭제 가능.
- **사용자 관리**: 시스템 접근 가능 인원 관리 및 권한 설정.

## 🛠 기술 스택

### Backend
- **Framework**: Spring Boot 3.3.0
- **Language**: Java 17
- **Security**: Spring Security (Session-based Auth)
- **Data**: Spring Data JPA, PostgreSQL (Render Managed)
- **Environment**: Dotenv-Java for credential management
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
- [Spark 연동 가이드](./SPARK_INTEGRATION_GUIDE.md): 데이터 엔지니어를 위한 DB 적재 매뉴얼.

## 🏃 Quick Starter (빠른 실행 가이드)

프로젝트를 로컬 환경에서 실행하기 위한 단계별 가이드입니다. 이 프로젝트는 Backend(Spring Boot)와 Frontend(React)를 각각 독립적으로 실행해야 합니다.

### 사전 준비 사항 (Prerequisites)
- **Java 17** 이상이 설치되어 있어야 합니다.
- **Node.js** (v18 이상 권장) 및 **npm**이 설치되어 있어야 합니다.
- (선택 사항) 실제 구글 지도를 보려면 구글 클라우드 콘솔에서 Maps JavaScript API 키를 발급받아야 합니다.

### Step 1: 구글 지도 API 키 설정 (Frontend)
실제 지도를 렌더링하기 위해 환경 변수 파일에 API 키를 등록합니다.
1. `frontend/` 디렉토리로 이동합니다.
2. `.env` 파일을 열고 발급받은 API 키를 입력합니다.
   ```env
   VITE_GOOGLE_MAPS_API_KEY=발급받은_실제_API_키
   ```
   *(API 키가 없어도 시스템은 동작하나, 지도는 로딩 화면 상태로 유지됩니다.)*

### Step 2: Backend (Spring Boot) 서버 실행
백엔드 서버는 기본적으로 `8080` 포트를 사용하며, 운영용 PostgreSQL DB(Render)와 연동됩니다. 보안을 위해 환경 변수 설정이 필요합니다.

1. `backend/` 디렉토리로 이동합니다.
2. `.env` 파일을 생성하고 제공받은 DB 접속 정보를 입력합니다. (이미 생성되어 있다면 확인만 하십시오.)
   ```env
   DB_URL=jdbc:postgresql://[HOST]:[PORT]/[DB_NAME]
   DB_USERNAME=[USERNAME]
   DB_PASSWORD=[PASSWORD]
   ```
3. Gradle Wrapper를 사용하여 서버를 실행합니다.
   ```bash
   # Mac / Linux
   ./gradlew bootRun
   
   # Windows
   gradlew.bat bootRun
   ```
4. 서버가 정상적으로 실행되면 브라우저에서 아래 주소로 접속하여 API 명세서를 확인할 수 있습니다.
   - **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Step 3: Frontend (React) 서버 실행
프론트엔드 서버는 Vite를 기반으로 동작하며, 기본적으로 `5173` 포트를 사용합니다. 내부적으로 백엔드 API(`/api/*`) 호출을 `localhost:8080`으로 프록시(Proxy)하도록 설정되어 있습니다.
1. 새로운 터미널 창을 열고 프로젝트 루트에서 `frontend` 디렉토리로 이동합니다.
   ```bash
   cd frontend
   ```
2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
4. 터미널에 출력된 로컬 주소(일반적으로 [http://localhost:5173](http://localhost:5173))를 브라우저로 엽니다.

### Step 4: 시스템 로그인 및 이용
서버가 처음 시작될 때 자동으로 최고 관리자 계정이 생성됩니다.
1. 브라우저에서 프론트엔드 주소로 접속하면 로그인 화면이 나타납니다.
2. 아래의 초기 관리자 계정으로 로그인합니다.
   - **아이디 (이메일)**: `admin@example.com`
   - **비밀번호**: `1234`
3. 로그인에 성공하면 대시보드로 이동하며, 좌측 사이드바를 통해 데이터 관리, 지도 보기, 사용자 권한 관리 등의 기능을 이용하실 수 있습니다.

## 📝 변경 이력 (Changelog)
상세한 업데이트 내역은 [CHANGELOG.md](./CHANGELOG.md)를 참조하십시오.
