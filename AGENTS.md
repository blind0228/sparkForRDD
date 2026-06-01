# AI Agent 헌법 (Project Constitution)

이 문서는 AI 에이전트가 `sparkForRDD` 프로젝트에서 작업할 때 반드시 준수해야 하는 핵심 원칙과 가이드라인입니다.

## 1. 언어 및 커뮤니케이션 (Language & Communication)
*   **모든 공식 문서(README, 설계 문서, 주석 등)는 반드시 한국어(Korean)로 작성한다.**
*   사용자와의 대화 및 설명 또한 한국어를 기본으로 한다.
*   단, 코드 내의 변수명, 클래스명, 함수명 등은 영어를 사용한다.

## 2. 문서화 및 변경 이력 관리 (Documentation & Changelog)
*   **변경 이력(Changelog) 필수 기록**: 프로젝트의 주요 구조적 변경, 기능 추가, 설계 수정이 발생할 경우 반드시 별도의 로그(예: `CHANGELOG.md` 또는 `docs/changelog/` 디렉토리 내의 파일)에 기록을 남겨야 한다.
*   모든 설계 문서는 `docs/` 디렉토리에 용도별로 분류하여 저장한다.

## 3. 기술 스택 (Tech Stack)
*   **Backend**: Java, Spring Boot 3.x, Spring Data JPA
*   **Frontend**: React (TypeScript), Tailwind CSS
*   **Database**: H2 (개발용), MySQL (운영용)

## 4. 코딩 스타일 및 아키텍처 (Coding Style & Architecture)
*   Spring Boot 백엔드는 Controller - Service - Repository의 계층적 아키텍처를 엄격히 따른다.
*   React 프론트엔드는 함수형 컴포넌트와 Hooks를 사용하며, 재사용 가능한 UI 컴포넌트로 분리한다.

## 5. 테스트 주도 개발 (TDD) 원칙
*   **테스트 우선 작성 (Test-First)**: 모든 기능 구현 전에 반드시 해당 기능을 검증할 수 있는 실패하는 테스트 코드를 먼저 작성한다.
*   **최소 구현**: 테스트를 통과하기 위한 최소한의 코드만을 작성하여 구현을 시작하며, 이후 리팩토링을 통해 완성도를 높인다.
*   **비즈니스 로직 보호**: 핵심 비즈니스 로직(Service 레이어 등)은 반드시 높은 테스트 커버리지를 유지하여 변경 사항으로부터 보호한다.
*   **검증 자동화**: 모든 구현 작업 완료 후에는 전체 테스트 수트를 실행하여 회귀 오류가 없는지 확인한다.

## 6. 작업 프로세스 (Workflow)
*   **Superpowers 워크플로우 준수**: 구현 전 `brainstorming`을 통한 설계 확정, `writing-plans`를 통한 작업 계획 수립, `test-driven-development` (TDD) 원칙에 따른 구현을 지향한다.
*   새로운 기능을 구현하기 전에 기존의 아키텍처와 컨벤션을 먼저 분석하고 일치시킨다.

## 6. 보안 (Security)
*   데이터베이스 비밀번호, API 키 등 민감한 정보는 절대 코드에 하드코딩하지 않으며, 환경 변수(`.env` 등)를 통해 관리한다.