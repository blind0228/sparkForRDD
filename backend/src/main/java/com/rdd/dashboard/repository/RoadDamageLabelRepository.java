package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamageLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadDamageLabelRepository extends JpaRepository<RoadDamageLabel, Long> {
    List<RoadDamageLabel> findByFileName(String fileName);

    @Query("SELECT new com.rdd.dashboard.dto.DamageStatsDto(rl.damageCode, rl.damageName, COUNT(rl)) " +
           "FROM RoadDamageLabel rl GROUP BY rl.damageCode, rl.damageName")
    List<DamageStatsDto> findDamageTypeStats();

    @Query(value = "SELECT rm.country, rl.damage_code, COUNT(*) as count " +
            "FROM road_damage_labels rl " +
            "JOIN road_damage_markers rm ON rl.file_name = rm.file_name " +
            "GROUP BY rm.country, rl.damage_code " +
            "ORDER BY rm.country, count DESC", nativeQuery = true)
    List<Object[]> findCountryDamageTypeStats();
}
