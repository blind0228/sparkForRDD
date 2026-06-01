# RDD 대시보드 구현 계획

> **에이전트 작업자 필독:** 이 계획을 태스크별로 구현하려면 REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`(권장) 또는 `superpowers:executing-plans`를 사용하십시오. 단계는 추적을 위해 체크박스(`- [ ]`) 구문을 사용합니다.

**목표:** 도로 손상 데이터셋(RDD) 분석 결과를 시각화하는 대시보드(Spring Boot + React)를 구축합니다.

**아키텍처:** Spring Boot 백엔드는 H2/MySQL DB에서 데이터를 조회하여 REST API를 제공하고, React 프론트엔드는 이 API를 호출하여 Recharts와 Google Maps로 시각화합니다.

**기술 스택:** Java, Spring Boot 3.x, Spring Data JPA, React, TypeScript, Tailwind CSS, Recharts, Google Maps API.

---

### Task 1: 백엔드 프로젝트 초기화 및 기본 설정

**파일:**
- 생성: `backend/pom.xml` (또는 `build.gradle`)
- 생성: `backend/src/main/resources/application.yml`
- 생성: `backend/src/main/java/com/rdd/dashboard/RddDashboardApplication.java`

- [ ] **단계 1: Spring Boot 프로젝트 구조 생성 및 의존성 설정**
- [ ] **단계 2: H2 데이터베이스 및 JPA 설정 작성**
- [ ] **단계 3: 메인 애플리케이션 클래스 작성 및 실행 확인**
- [ ] **단계 4: 커밋**

### Task 2: RoadDamage 엔티티 및 리포지토리 구현

**파일:**
- 생성: `backend/src/main/java/com/rdd/dashboard/entity/RoadDamage.java`
- 생성: `backend/src/main/java/com/rdd/dashboard/repository/RoadDamageRepository.java`
- 생성: `backend/src/test/java/com/rdd/dashboard/repository/RoadDamageRepositoryTest.java`

- [ ] **단계 1: 리포지토리 테스트 작성 (데이터 저장 및 조회 확인)**
- [ ] **단계 2: RoadDamage 엔티티 구현 (damageType, latitude, longitude, capturedAt)**
- [ ] **단계 3: RoadDamageRepository 인터페이스 구현**
- [ ] **단계 4: 테스트 실행 및 통과 확인**
- [ ] **단계 5: 커밋**

### Task 3: REST API 컨트롤러 구현

**파일:**
- 생성: `backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java`
- 생성: `backend/src/main/java/com/rdd/dashboard/dto/DamageStatsDto.java`
- 생성: `backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java`

- [ ] **단계 1: 컨트롤러 테스트 작성 (MockMvc 사용)**
- [ ] **단계 2: API 엔드포인트 `/api/damages` 및 `/api/damages/stats` 구현**
- [ ] **단계 3: 테스트 실행 및 통과 확인**
- [ ] **단계 4: 커밋**

### Task 4: 프론트엔드 프로젝트 초기화 및 기초 UI

**파일:**
- 생성: `frontend/package.json`
- 생성: `frontend/src/App.tsx`
- 생성: `frontend/tailwind.config.js`

- [ ] **단계 1: React (Vite/TS) 프로젝트 생성 및 Tailwind CSS 설정**
- [ ] **단계 2: 대시보드 기본 레이아웃 (Header, Main Grid) 작성**
- [ ] **단계 3: 커밋**

### Task 4: 통계 차트 및 데이터 테이블 구현

**파일:**
- 생성: `frontend/src/components/StatsChart.tsx`
- 생성: `frontend/src/components/DamageTable.tsx`

- [ ] **단계 1: Recharts를 사용한 통계 차트 컴포넌트 구현**
- [ ] **단계 2: 테이블 UI 및 API 연동 (fetch)**
- [ ] **단계 3: 커밋**

### Task 5: Google Maps 위치 표시 구현

**파일:**
- 생성: `frontend/src/components/MapContainer.tsx`

- [ ] **단계 1: Google Maps React 라이브러리 설치 및 설정**
- [ ] **단계 2: API 데이터를 지도 마커로 표시하는 로직 구현**
- [ ] **단계 3: 커밋**
