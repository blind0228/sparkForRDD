# 변경 이력 (Changelog)

## [2026-06-01]
### 추가
- 백엔드 프로젝트 초기화 (Spring Boot 3.3.0, Java 17, Gradle)
- H2 데이터베이스 및 JPA 기본 설정
- 메인 애플리케이션 클래스 및 기본 테스트 코드
- RoadDamage 엔티티 및 리포지토리 구현 (TDD 적용)
- Gradle Wrapper (gradlew) 생성 및 설정
- REST API 컨트롤러 (/api/damages, /api/damages/stats) 구현 (TDD 적용)
- Swagger UI (SpringDoc OpenAPI) 도입 및 API 문서화
- 헬스 체크 API (/api/health) 추가
- 공식 API 명세서 (docs/api-spec.md) 작성
- 세션 기반 로그인 인증 (Spring Security) 구현 (ID: admin@example.com, PW: 1234)
- API 보안 적용 (인증된 사용자만 접근 가능, Health API 및 Swagger 제외)
- Stitch MCP에서 '도로 손상 통합 관리 시스템' 디자인 정보를 추출하여 최상위 경로에 DESIGN.md 작성
