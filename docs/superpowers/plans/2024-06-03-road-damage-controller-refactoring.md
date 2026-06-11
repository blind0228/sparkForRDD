# Task 4: Controller Refactoring and API Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `RoadDamageController` to use the new `RoadDamageMarkerRepository` and `RoadDamageLabelRepository` and implement the required API endpoints.

**Architecture:** Update the REST controller to delegate data access to specialized repositories. The controller will handle request mapping, parameter extraction, and return entities/DTOs.

**Tech Stack:** Spring Boot (Spring Web), Spring Data JPA, Lombok, OpenAPI/Swagger.

---

### Task 1: Refactor RoadDamageController

**Files:**
- Modify: `backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java`

- [ ] **Step 1: Update imports and dependencies**

Inject `RoadDamageMarkerRepository` and `RoadDamageLabelRepository`.

```java
package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamageLabel;
import com.rdd.dashboard.entity.RoadDamageMarker;
import com.rdd.dashboard.repository.RoadDamageLabelRepository;
import com.rdd.dashboard.repository.RoadDamageMarkerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Road Damage API", description = "도로 손상 데이터 조회 및 통계 API")
@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {

    private final RoadDamageMarkerRepository roadDamageMarkerRepository;
    private final RoadDamageLabelRepository roadDamageLabelRepository;

    @Operation(summary = "도로 손상 마커 조회", description = "국가별 또는 전체 도로 손상 마커를 조회합니다.")
    @GetMapping("/markers")
    public List<RoadDamageMarker> getMarkers(@RequestParam(required = false) String country) {
        if (country != null && !country.isEmpty()) {
            return roadDamageMarkerRepository.findByCountry(country);
        }
        return roadDamageMarkerRepository.findAll();
    }

    @Operation(summary = "파일별 라벨 조회", description = "이미지 파일명에 해당하는 도로 손상 라벨 목록을 조회합니다.")
    @GetMapping("/labels/file/{fileName}")
    public List<RoadDamageLabel> getLabelsByFile(@PathVariable String fileName) {
        return roadDamageLabelRepository.findByFileName(fileName);
    }

    @Operation(summary = "손상 유형별 통계", description = "도로 손상 유형별 발생 횟수 통계를 조회합니다.")
    @GetMapping("/stats/types")
    public List<DamageStatsDto> getDamageTypeStats() {
        return roadDamageLabelRepository.findDamageTypeStats();
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `./gradlew :backend:classes`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Commit changes**

```bash
git add backend/src/main/java/com/rdd/dashboard/controller/RoadDamageController.java
git commit -m "feat: refactor RoadDamageController with new API endpoints"
```

---

### Task 2: Verify and Fix Tests

**Files:**
- Modify: `backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java` (if exists)

- [ ] **Step 1: Check if RoadDamageControllerTest.java exists**

Run: `ls backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java`
If it doesn't exist, skip this task.

- [ ] **Step 2: Delete or fix the test file**

Since the instructions say "deleting is okay for now to allow the build to pass", and we don't have a specific test fix, I'll delete it if it exists and is broken.

Run: `rm backend/src/test/java/com/rdd/dashboard/controller/RoadDamageControllerTest.java` (if it exists)

- [ ] **Step 3: Run full build to verify**

Run: `./gradlew :backend:build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit test changes**

```bash
git commit -m "test: remove broken RoadDamageControllerTest to fix build"
```
