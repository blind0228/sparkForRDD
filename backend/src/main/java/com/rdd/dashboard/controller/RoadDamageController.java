package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 도로 손상 정보를 제공하는 REST 컨트롤러
 */
@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class RoadDamageController {

    private final RoadDamageRepository roadDamageRepository;

    /**
     * 모든 도로 손상 목록을 반환한다.
     */
    @GetMapping
    public List<RoadDamage> getAllDamages() {
        return roadDamageRepository.findAll();
    }

    /**
     * 손상 유형별 통계 정보를 반환한다.
     */
    @GetMapping("/stats")
    public List<DamageStatsDto> getDamageStats() {
        return roadDamageRepository.findAllDamageStats();
    }
}
