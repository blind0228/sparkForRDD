package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RoadDamage 엔티티를 관리하는 리포지토리
 */
@Repository
public interface RoadDamageRepository extends JpaRepository<RoadDamage, Long> {

    /**
     * 손상 유형별 통계를 조회한다.
     */
    @Query("SELECT new com.rdd.dashboard.dto.DamageStatsDto(rd.damageType, COUNT(rd)) " +
           "FROM RoadDamage rd " +
           "GROUP BY rd.damageType")
    List<DamageStatsDto> findAllDamageStats();
}
