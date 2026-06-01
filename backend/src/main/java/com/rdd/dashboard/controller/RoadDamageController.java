package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
     * 조건에 맞는 도로 손상 목록을 페이징하여 반환한다.
     */
    @Operation(summary = "도로 손상 페이징 조회", description = "대용량 데이터를 위한 서버사이드 페이징 및 필터링 조회를 지원합니다.")
    @GetMapping
    public Page<RoadDamage> getDamages(
            @RequestParam(required = false) String damageType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String type = "ALL".equalsIgnoreCase(damageType) ? null : damageType;
        return roadDamageRepository.findWithPagination(type, PageRequest.of(page, size, Sort.by("id").descending()));
    }

    /**
     * 화면 영역(Bounding Box)에 해당하는 도로 손상 목록을 반환한다.
     */
    @Operation(summary = "지도 영역 데이터 조회", description = "지도의 현재 화면 위경도 영역 내에 포함되는 데이터만 조회합니다.")
    @GetMapping("/map")
    public List<RoadDamage> getDamagesForMap(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng,
            @RequestParam(required = false) String damageType
    ) {
        String type = "ALL".equalsIgnoreCase(damageType) ? null : damageType;
        return roadDamageRepository.findInBounds(minLat, maxLat, minLng, maxLng, type);
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
