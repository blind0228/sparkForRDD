package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.CountryStatsDto;
import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.dto.MarkerClusterDto;
import com.rdd.dashboard.entity.RoadDamageLabel;
import com.rdd.dashboard.entity.RoadDamageMarker;
import com.rdd.dashboard.repository.RoadDamageLabelRepository;
import com.rdd.dashboard.repository.RoadDamageMarkerRepository;
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

    private final RoadDamageMarkerRepository roadDamageMarkerRepository;
    private final RoadDamageLabelRepository roadDamageLabelRepository;

    @Operation(summary = "도로 손상 마커 조회 (페이징)", description = "데이터 목록 페이지를 위한 페이징된 마커 목록을 조회합니다.")
    @GetMapping
    public Page<RoadDamageMarker> getPaginatedMarkers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String country) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (country != null && !country.isEmpty()) {
            return roadDamageMarkerRepository.findByCountry(country, pageable);
        }
        return roadDamageMarkerRepository.findAll(pageable);
    }

    @Operation(summary = "도로 손상 마커 조회", description = "영역(BBox), 국가별 또는 전체 도로 손상 마커를 조회합니다.")
    @GetMapping("/markers")
    public List<RoadDamageMarker> getMarkers(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double maxLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(defaultValue = "1000") Integer limit) {
        
        if (minLat != null && minLng != null && maxLat != null && maxLng != null) {
            return roadDamageMarkerRepository.findMarkersInViewport(minLat, minLng, maxLat, maxLng, limit);
        }
        
        if (country != null && !country.isEmpty()) {
            return roadDamageMarkerRepository.findByCountry(country, PageRequest.of(0, limit)).getContent();
        }
        return roadDamageMarkerRepository.findRecentMarkers(limit);
    }

    @Operation(summary = "도로 손상 클러스터 조회", description = "영역(BBox) 내의 마커들을 그리드 단위로 집계하여 클러스터링된 데이터를 조회합니다.")
    @GetMapping("/clusters")
    public List<MarkerClusterDto> getClusters(
            @RequestParam Double minLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLat,
            @RequestParam Double maxLng,
            @RequestParam(defaultValue = "0.1") Double gridSize) {
        
        List<Object[]> results = roadDamageMarkerRepository.findClustersInViewport(minLat, minLng, maxLat, maxLng, gridSize);
        return results.stream()
                .map(row -> new MarkerClusterDto(
                        (Double) row[0],
                        (Double) row[1],
                        ((Number) row[2]).longValue()
                ))
                .toList();
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

    @Operation(summary = "일별 마커 통계", description = "날짜별 도로 손상 마커 개수 통계를 조회합니다.")
    @GetMapping("/stats/daily")
    public List<Object[]> getDailyStats() {
        return roadDamageMarkerRepository.findDailyStats();
    }
}
