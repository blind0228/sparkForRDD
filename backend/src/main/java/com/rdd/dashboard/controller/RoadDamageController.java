package com.rdd.dashboard.controller;

// import com.rdd.dashboard.dto.CountryStatsDto;
// import com.rdd.dashboard.dto.DamageStatsDto;
// import com.rdd.dashboard.entity.RoadDamage;
// import com.rdd.dashboard.repository.RoadDamageRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 도로 손상 정보를 제공하는 REST 컨트롤러 (Refactoring in progress)
 */
@Tag(name = "Road Damage API", description = "도로 손상 데이터 조회 및 통계 API")
@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {

    /*
    private final RoadDamageRepository roadDamageRepository;

    @GetMapping
    public Page<RoadDamage> getDamages(...) { ... }

    @GetMapping("/map")
    public List<RoadDamage> getDamagesForMap(...) { ... }

    @GetMapping("/stats")
    public List<DamageStatsDto> getDamageStats() { ... }

    @GetMapping("/stats/countries")
    public List<CountryStatsDto> getCountryStats() { ... }

    @PostMapping
    public RoadDamage createDamage(@RequestBody RoadDamage roadDamage) { ... }

    @DeleteMapping("/{id}")
    public void deleteDamage(@PathVariable Long id) { ... }
    */
}
