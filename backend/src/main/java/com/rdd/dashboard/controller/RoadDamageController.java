package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.CountryStatsDto;
import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.dto.MarkerClusterDto;
import com.rdd.dashboard.entity.RoadDamageLabel;
import com.rdd.dashboard.entity.RoadDamageMarker;
import com.rdd.dashboard.repository.RoadDamageLabelRepository;
import com.rdd.dashboard.repository.RoadDamageMarkerRepository;
import com.rdd.dashboard.service.AiReportService;
import com.rdd.dashboard.service.SpatialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
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
    private final AiReportService aiReportService;
    private final SpatialService spatialService;

    @Operation(summary = "AI 분석 보고서 생성", description = "AI를 사용하여 현재 데이터를 분석하고 PDF 보고서를 생성합니다.")
    @GetMapping("/report/ai")
    public ResponseEntity<byte[]> getAiReport() {
        byte[] pdfContent = aiReportService.generateAiReport();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ai_road_damage_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @Operation(summary = "공간 필터링 상태 확인", description = "육지/바다 필터링 서비스의 초기화 상태 및 로드된 데이터 수를 확인합니다.")
    @GetMapping("/spatial-status")
    public java.util.Map<String, Object> getSpatialStatus() {
        return java.util.Map.of(
                "initialized", spatialService.isInitialized(),
                "polygonCount", spatialService.getPolygonCount()
        );
    }

    @Operation(summary = "도로 손상 마커 조회 (페이징)", description = "데이터 목록 페이지를 위한 페이징된 마커 목록을 조회합니다.")
    @GetMapping
    public Page<RoadDamageMarker> getPaginatedMarkers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String country) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (country != null && !country.isEmpty()) {
            return roadDamageMarkerRepository.findByCountry(country, pageable)
                    .map(this::transformMarkerImageUrl);
        }
        return roadDamageMarkerRepository.findAll(pageable)
                .map(this::transformMarkerImageUrl);
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
        
        List<RoadDamageMarker> markers;
        if (minLat != null && minLng != null && maxLat != null && maxLng != null) {
            markers = roadDamageMarkerRepository.findMarkersInViewport(minLat, minLng, maxLat, maxLng, limit);
        } else if (country != null && !country.isEmpty()) {
            markers = roadDamageMarkerRepository.findByCountry(country, PageRequest.of(0, limit)).getContent();
        } else {
            markers = roadDamageMarkerRepository.findRecentMarkers(limit);
        }

        return markers.stream()
                .filter(m -> spatialService.isPointOnLand(m.getLatitude(), m.getLongitude()))
                .map(this::transformMarkerImageUrl)
                .toList();
    }

    private RoadDamageMarker transformMarkerImageUrl(RoadDamageMarker marker) {
        String fileName = marker.getFileName();
        if (fileName == null) return marker;

        // 원본: China_MotorBike_000000_jpg.rf.f55...txt
        // 대상: China_MotorBike_000000_jpg.rf.f55...jpg
        String imageFileName = fileName.replace(".txt", ".jpg");
        String country = marker.getCountry();
        
        // 국가명 매핑
        String countryDir = country;
        if (country == null) {
            countryDir = "china-motorbike_txt";
        } else if (country.toLowerCase().contains("china")) {
            countryDir = "china-motorbike_txt";
        } else if ("India".equalsIgnoreCase(country)) {
            countryDir = "india_txt";
        } else if ("Japan".equalsIgnoreCase(country)) {
            countryDir = "japan_txt";
        } else if ("Norway".equalsIgnoreCase(country)) {
            countryDir = "norway_txt";
        } else if (country.toLowerCase().contains("united") || country.toLowerCase().contains("usa")) {
            countryDir = "USA_txt";
        } else if (country.toLowerCase().contains("czech")) {
            countryDir = "Czech Republic_txt";
        } else {
            countryDir = country.toLowerCase() + "_txt";
        }

        String baseDir = "/Users/blind/N-RDD2024-2/TestDataSet/";
        String trainPath = String.format("%s/train/images/%s", countryDir, imageFileName);
        String validPath = String.format("%s/valid/images/%s", countryDir, imageFileName);
        
        // 실제 파일 존재 여부 확인 (옵션: 속도 저하가 우려되면 Spring ResourceChain에 맡길 수도 있음)
        // 하지만 여기서는 정확한 URL을 위해 체크
        File trainFile = new File(baseDir + trainPath);
        if (trainFile.exists()) {
            marker.setImageUrl("/images/" + trainPath);
        } else {
            // train에 없으면 valid로 설정
            marker.setImageUrl("/images/" + validPath);
        }
        
        return marker;
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
                .filter(c -> spatialService.isPointOnLand(c.getLatitude(), c.getLongitude()))
                .toList();
    }

    @Operation(summary = "파일별 라벨 조회", description = "이미지 파일명에 해당하는 도로 손상 라벨 목록을 조회합니다.")
    @GetMapping("/labels/file/{fileName}")
    public List<RoadDamageLabel> getLabelsByFile(@PathVariable String fileName) {
        List<RoadDamageLabel> labels = roadDamageLabelRepository.findByFileName(fileName);
        for (RoadDamageLabel label : labels) {
            System.out.println(String.format("Label Check [%s]: x=%.4f, y=%.4f, w=%.4f, h=%.4f", 
                fileName, label.getXCenter(), label.getYCenter(), label.getBboxWidth(), label.getBboxHeight()));
        }
        return labels;
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

    @Operation(summary = "국가별-유형별 통계", description = "국가별 파손 유형 분포 통계를 조회합니다.")
    @GetMapping("/stats/country-types")
    public List<Object[]> getCountryDamageTypeStats() {
        return roadDamageLabelRepository.findCountryDamageTypeStats();
    }

    @Operation(summary = "일별 마커 통계", description = "날짜별 도로 손상 마커 개수 통계를 조회합니다.")
    @GetMapping("/stats/daily")
    public List<Object[]> getDailyStats() {
        return roadDamageMarkerRepository.findDailyStats();
    }
}
