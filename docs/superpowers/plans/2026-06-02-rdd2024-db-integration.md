# RDD2024 데이터베이스 통합 구현 계획 (RDD2024 Database Integration Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 H2 임베디드 DB를 Render PostgreSQL로 교체하고, RDD2024의 `road_damage_markers` 및 `road_damage_labels` 테이블 구조에 맞게 백엔드를 재구성합니다.

**Architecture:** `.env`를 통한 보안 설정, JPA 엔티티 분리(Marker/Label), 그리고 통계 및 상세 조회를 위한 REST API 리팩토링.

**Tech Stack:** Java 17, Spring Boot 3.3.0, Spring Data JPA, PostgreSQL Driver, Dotenv-Java.

---

### Task 1: 데이터베이스 의존성 및 환경 설정

**Files:**
- Modify: `backend/build.gradle`
- Create: `backend/.env`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: PostgreSQL 및 Dotenv 의존성 추가**

```gradle
dependencies {
    // ... 기존 의존성
    implementation 'org.postgresql:postgresql'
    implementation 'io.github.cdimascio:dotenv-java:3.0.0'
    // runtimeOnly 'com.h2database:h2' // 기존 H2는 유지하거나 주석 처리
}
```

- [ ] **Step 2: .env 파일 생성 (Git 제외 확인)**

```env
DB_URL=jdbc:postgresql://dpg-d8fe20eq1p3s73dsudeg-a.oregon-postgres.render.com/rdd_damage
DB_USERNAME=rdd_user
DB_PASSWORD=EBAkoywdVlVoXBXfayhQoB6mqelewtsi
```

- [ ] **Step 3: application.yml 수정**

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: validate
    show-sql: true
```

- [ ] **Step 4: 빌드 및 애플리케이션 실행 확인**
Run: `./gradlew :backend:build`
Expected: BUILD SUCCESSFUL (연결 테스트는 다음 단계에서 수행)

- [ ] **Step 5: Commit**
```bash
git add backend/build.gradle backend/src/main/resources/application.yml
git commit -m "chore: add postgresql and dotenv configuration"
```

---

### Task 2: 엔티티(Entity) 교체 및 생성

**Files:**
- Delete: `backend/src/main/java/com/rdd/dashboard/entity/RoadDamage.java`
- Create: `backend/src/main/java/com/rdd/dashboard/entity/RoadDamageMarker.java`
- Create: `backend/src/main/java/com/rdd/dashboard/entity/RoadDamageLabel.java`

- [ ] **Step 1: RoadDamageMarker 엔티티 구현**

```java
package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_markers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadDamageMarker {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String dataBatch;
    private String country;
    private String fileName;
    private String imageFileName;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Integer totalDamageCount;
    private LocalDateTime createdAt;
}
```

- [ ] **Step 2: RoadDamageLabel 엔티티 구현**

```java
package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_labels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadDamageLabel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String dataBatch;
    private String country;
    private String fileName;
    private String damageCode;
    private String damageName;
    private Integer classId;
    private Double xCenter;
    private Double yCenter;
    private Double bboxWidth;
    private Double bboxHeight;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/rdd/dashboard/entity/
git rm backend/src/main/java/com/rdd/dashboard/entity/RoadDamage.java
git commit -m "feat: replace RoadDamage entity with Marker and Label entities"
```

---

### Task 3: 리포지토리(Repository) 리팩토링

**Files:**
- Modify: `backend/src/main/java/com/rdd/dashboard/repository/RoadDamageRepository.java` -> Rename/Refactor
- Create: `backend/src/main/java/com/rdd/dashboard/repository/RoadDamageMarkerRepository.java`
- Create: `backend/src/main/java/com/rdd/dashboard/repository/RoadDamageLabelRepository.java`

- [ ] **Step 1: RoadDamageMarkerRepository 구현**

```java
package com.rdd.dashboard.repository;

import com.rdd.dashboard.entity.RoadDamageMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadDamageMarkerRepository extends JpaRepository<RoadDamageMarker, Long> {
    List<RoadDamageMarker> findByCountry(String country);
}
```

- [ ] **Step 2: RoadDamageLabelRepository 구현 (상세 및 통계)**

```java
package com.rdd.dashboard.repository;

import com.rdd.dashboard.entity.RoadDamageLabel;
import com.rdd.dashboard.dto.DamageStatsDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface RoadDamageLabelRepository extends JpaRepository<RoadDamageLabel, Long> {
    List<RoadDamageLabel> findByFileName(String fileName);

    @Query("SELECT new com.rdd.dashboard.dto.DamageStatsDto(rl.damageCode, rl.damageName, COUNT(rl)) " +
           "FROM RoadDamageLabel rl GROUP BY rl.damageCode, rl.damageName")
    List<DamageStatsDto> findDamageTypeStats();
}
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/rdd/dashboard/repository/
git commit -m "feat: implement Marker and Label repositories"
```

---

### Task 4: 컨트롤러(Controller) 리팩토링 및 API 완성

**Files:**
- Modify: `backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java`

- [ ] **Step 1: API 엔드포인트 전면 재구성**

```java
@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {
    private final RoadDamageMarkerRepository markerRepository;
    private final RoadDamageLabelRepository labelRepository;

    @GetMapping("/markers")
    public List<RoadDamageMarker> getMarkers(@RequestParam(required = false) String country) {
        if (country != null) return markerRepository.findByCountry(country);
        return markerRepository.findAll();
    }

    @GetMapping("/labels/file/{fileName}")
    public List<RoadDamageLabel> getLabelsByFile(@PathVariable String fileName) {
        return labelRepository.findByFileName(fileName);
    }

    @GetMapping("/stats/types")
    public List<DamageStatsDto> getStatsByTypes() {
        return labelRepository.findDamageTypeStats();
    }
}
```

- [ ] **Step 2: 빌드 및 최종 확인**
Run: `./gradlew :backend:build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit**
```bash
git add backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java
git commit -m "feat: refactor controller for Marker/Label API"
```
