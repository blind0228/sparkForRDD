# Road Damage Dashboard API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도로 손상 데이터 조회 및 통계 API 구현

**Architecture:** DamageStatsDto를 사용하여 통계 데이터를 전달하고, RoadDamageRepository에서 JPQL을 사용하여 통계를 집계합니다. RoadDamageController에서 REST 엔드포인트를 노출합니다.

**Tech Stack:** Java 17, Spring Boot 3, Spring Data JPA, MockMvc, Lombok

---

### Task 1: DamageStatsDto 생성

**Files:**
- Create: `backend/src/main/java/com/rdd/dashboard/dto/DamageStatsDto.java`

- [ ] **Step 1: DamageStatsDto 구현**

```java
package com.rdd.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DamageStatsDto {
    private String damageType;
    private Long count;
}
```

- [ ] **Step 2: 커밋**

```bash
git add backend/src/main/java/com/rdd/dashboard/dto/DamageStatsDto.java
git commit -m "feat: add DamageStatsDto for road damage statistics"
```

---

### Task 2: RoadDamageRepository 통계 쿼리 추가 및 테스트

**Files:**
- Modify: `backend/src/main/java/com/rdd/dashboard/repository/RoadDamageRepository.java`
- Modify: `backend/src/test/java/com/rdd/dashboard/repository/RoadDamageRepositoryTest.java`

- [ ] **Step 1: 레포지토리 테스트 작성 (실패 확인)**

`backend/src/test/java/com/rdd/dashboard/repository/RoadDamageRepositoryTest.java`에 추가:
```java
    @Test
    @DisplayName("손상 유형별 통계를 조회한다.")
    void findDamageStats() {
        // given
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.1)
                .longitude(127.1)
                .capturedAt(LocalDateTime.now())
                .build());
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.2)
                .longitude(127.2)
                .capturedAt(LocalDateTime.now())
                .build());
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Crack")
                .latitude(37.3)
                .longitude(127.3)
                .capturedAt(LocalDateTime.now())
                .build());

        // when
        List<DamageStatsDto> stats = roadDamageRepository.findAllDamageStats();

        // then
        assertThat(stats).hasSize(2);
        assertThat(stats).extracting("damageType", "count")
                .containsExactlyInAnyOrder(
                        tuple("Pothole", 2L),
                        tuple("Crack", 1L)
                );
    }
```
(필요한 import 추가: `java.util.List`, `com.rdd.dashboard.dto.DamageStatsDto`, `static org.assertj.core.groups.Tuple.tuple`)

- [ ] **Step 2: 테스트 실행 및 실패 확인**

Run: `./gradlew test --tests com.rdd.dashboard.repository.RoadDamageRepositoryTest`
Expected: 컴파일 에러 (findAllDamageStats 메서드 없음)

- [ ] **Step 3: RoadDamageRepository에 JPQL 쿼리 추가**

```java
package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadDamageRepository extends JpaRepository<RoadDamage, Long> {

    @Query("SELECT new com.rdd.dashboard.dto.DamageStatsDto(rd.damageType, COUNT(rd)) " +
           "FROM RoadDamage rd " +
           "GROUP BY rd.damageType")
    List<DamageStatsDto> findAllDamageStats();
}
```

- [ ] **Step 4: 테스트 실행 및 성공 확인**

Run: `./gradlew test --tests com.rdd.dashboard.repository.RoadDamageRepositoryTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/rdd/dashboard/repository/RoadDamageRepository.java \
        backend/src/test/java/com/rdd/dashboard/repository/RoadDamageRepositoryTest.java
git commit -m "feat: add findAllDamageStats query to RoadDamageRepository"
```

---

### Task 3: RoadDamageController 구현 및 테스트

**Files:**
- Create: `backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java`
- Create: `backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java`

- [ ] **Step 1: 컨트롤러 테스트 작성 (실패 확인)**

`backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java` 생성:
```java
package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoadDamageController.class)
class RoadDamageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoadDamageRepository roadDamageRepository;

    @Test
    @DisplayName("모든 도로 손상 목록을 조회한다.")
    void getAllDamages() throws Exception {
        // given
        RoadDamage damage = RoadDamage.builder()
                .id(1L)
                .damageType("Pothole")
                .latitude(37.1)
                .longitude(127.1)
                .capturedAt(LocalDateTime.now())
                .build();
        given(roadDamageRepository.findAll()).willReturn(List.of(damage));

        // when & then
        mockMvc.perform(get("/api/damages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].damageType").value("Pothole"))
                .andExpect(jsonPath("$[0].latitude").value(37.1));
    }

    @Test
    @DisplayName("손상 유형별 통계를 조회한다.")
    void getDamageStats() throws Exception {
        // given
        DamageStatsDto stats = new DamageStatsDto("Pothole", 5L);
        given(roadDamageRepository.findAllDamageStats()).willReturn(List.of(stats));

        // when & then
        mockMvc.perform(get("/api/damages/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].damageType").value("Pothole"))
                .andExpect(jsonPath("$[0].count").value(5));
    }
}
```

- [ ] **Step 2: 테스트 실행 및 실패 확인**

Run: `./gradlew test --tests com.rdd.dashboard.controller.RoadDamageControllerTest`
Expected: 컴파일 에러 (RoadDamageController 없음)

- [ ] **Step 3: RoadDamageController 구현**

```java
package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {

    private final RoadDamageRepository roadDamageRepository;

    @GetMapping
    public List<RoadDamage> getAllDamages() {
        return roadDamageRepository.findAll();
    }

    @GetMapping("/stats")
    public List<DamageStatsDto> getDamageStats() {
        return roadDamageRepository.findAllDamageStats();
    }
}
```

- [ ] **Step 4: 테스트 실행 및 성공 확인**

Run: `./gradlew test --tests com.rdd.dashboard.controller.RoadDamageControllerTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java \
        backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java
git commit -m "feat: implement RoadDamageController with endpoints /api/damages and /api/damages/stats"
```

---

### Task 4: 최종 통합 확인

- [ ] **Step 1: 전체 테스트 실행**

Run: `./gradlew test`
Expected: 모든 테스트 통과

- [ ] **Step 2: 커밋**

```bash
git commit --allow-empty -m "chore: complete task 3 - REST API controller implementation"
```
