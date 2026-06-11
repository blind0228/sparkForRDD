package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * 손상 유형 필터링 및 페이징 처리를 지원하는 목록 조회
     */
    @Query("SELECT rd FROM RoadDamage rd WHERE (:type IS NULL OR rd.damageType = :type)")
    Page<RoadDamage> findWithPagination(@Param("type") String type, Pageable pageable);

    /**
     * 지도 영역(Bounding Box) 기반 데이터 조회
     */
    @Query("SELECT rd FROM RoadDamage rd " +
           "WHERE rd.latitude BETWEEN :minLat AND :maxLat " +
           "AND rd.longitude BETWEEN :minLng AND :maxLng " +
           "AND (:type IS NULL OR rd.damageType = :type)")
    List<RoadDamage> findInBounds(@Param("minLat") Double minLat, 
                                  @Param("maxLat") Double maxLat, 
                                  @Param("minLng") Double minLng, 
                                  @Param("maxLng") Double maxLng, 
                                  @Param("type") String type);
}
