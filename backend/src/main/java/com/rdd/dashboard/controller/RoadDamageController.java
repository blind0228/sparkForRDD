package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 도로 손상 정보를 제공하는 REST 컨트롤러
 */
@Tag(name = "Road Damage API", description = "도로 손상 데이터 조회 및 통계 API")
@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {

    private final RoadDamageRepository roadDamageRepository;

    /**
     * 모든 도로 손상 목록을 반환한다.
     */
    @Operation(summary = "전체 손상 목록 조회", description = "데이터베이스에 저장된 모든 도로 손상 정보를 반환합니다.")
    @GetMapping
    public List<RoadDamage> getAllDamages() {
        return roadDamageRepository.findAll();
    }

    /**
     * 손상 유형별 통계 정보를 반환한다.
     */
    @Operation(summary = "손상 유형별 통계 조회", description = "도로 손상 유형(damageType)별로 집계된 건수를 반환합니다.")
    @GetMapping("/stats")
    public List<DamageStatsDto> getDamageStats() {
        return roadDamageRepository.findAllDamageStats();
    }

    /**
     * 새로운 도로 손상 정보를 등록한다.
     */
    @Operation(summary = "도로 손상 정보 등록", description = "새로운 도로 손상 정보를 데이터베이스에 저장합니다.")
    @PostMapping
    public RoadDamage createDamage(@RequestBody RoadDamage roadDamage) {
        if (roadDamage.getCapturedAt() == null) {
            roadDamage.setCapturedAt(java.time.LocalDateTime.now());
        }
        return roadDamageRepository.save(roadDamage);
    }

    /**
     * 특정 도로 손상 정보를 삭제한다.
     */
    @Operation(summary = "도로 손상 정보 삭제", description = "ID를 기반으로 특정 도로 손상 정보를 삭제합니다.")
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public void deleteDamage(@org.springframework.web.bind.annotation.PathVariable Long id) {
        roadDamageRepository.deleteById(id);
    }
}
