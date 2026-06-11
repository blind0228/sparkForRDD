# Road Damage Dashboard API Design

## Goal
도로 손상 데이터를 조회하고 유형별 통계를 제공하는 REST API를 구현합니다.

## Components

### 1. Data Transfer Object (DTO)
- `DamageStatsDto`: 손상 유형별 통계 정보를 담는 DTO.
    - `String damageType`: 손상 유형
    - `Long count`: 해당 유형의 발생 횟수

### 2. Repository Enhancement
- `RoadDamageRepository`: 손상 유형별 통계를 가져오는 JPQL 쿼리 추가.
    - `SELECT new com.rdd.dashboard.dto.DamageStatsDto(rd.damageType, COUNT(rd)) FROM RoadDamage rd GROUP BY rd.damageType`

### 3. REST Controller
- `RoadDamageController`: `/api/damages` 경로의 요청을 처리.
    - `GET /api/damages`: 모든 도로 손상 목록 조회.
    - `GET /api/damages/stats`: 손상 유형별 통계 정보 조회.

## Error Handling
- 기본적으로 Spring Boot의 예외 처리 메커니즘을 따르며, 데이터가 없는 경우 빈 목록을 반환합니다.

## Testing Strategy
- `RoadDamageControllerTest`: MockMvc를 사용하여 컨트롤러 레이어 테스트.
- `RoadDamageRepositoryTest`: 추가된 JPQL 쿼리에 대한 통합 테스트.
