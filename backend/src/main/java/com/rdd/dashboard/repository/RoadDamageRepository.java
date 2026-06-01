package com.rdd.dashboard.repository;

import com.rdd.dashboard.entity.RoadDamage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * RoadDamage 엔티티를 관리하는 리포지토리
 */
@Repository
public interface RoadDamageRepository extends JpaRepository<RoadDamage, Long> {
}
