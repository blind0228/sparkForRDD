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
- 도로 손상 데이터 등록(POST) 및 삭제(DELETE) API 추가
- Stitch MCP 디자인 가이드를 반영한 프론트엔드-백엔드 연동 및 통합 테스트 수행
- 데이터베이스 기반 사용자 관리(회원가입, 조회, 삭제) 백엔드 API 추가 및 프론트엔드 연동
- 실제 구글 지도(Google Maps API) 연동 및 다크 모드 스타일 적용 (MapMode)
- 빅데이터 렌더링 최적화를 위한 지도 마커 클러스터링(MarkerClusterer) 기능 적용
- 대용량 데이터 처리를 위한 백엔드 최적화 (서버사이드 페이징, 화면 영역 기반 Bounding Box 조회) 및 프론트엔드 연동
- 지도 화면 내 주소 검색 기능 (Geocoding API) 추가
- 메인 대시보드(Dashboard)의 통계, 차트, 최근 보고 기록, 유지보수 일정 테이블을 실제 백엔드 데이터와 완벽 동기화 (모든 목업 데이터 제거 완료)
