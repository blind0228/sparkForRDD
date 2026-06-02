package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.CountryStatsDto;
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

/**
 * 도로 손상 정보를 제공하는 REST 컨트롤러
 */
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

    @Operation(summary = "국가별 마커 통계", description = "국가별 도로 손상 마커 개수 통계를 조회합니다.")
    @GetMapping("/stats/countries")
    public List<CountryStatsDto> getCountryStats() {
        return roadDamageMarkerRepository.findCountryStats();
    }
}
