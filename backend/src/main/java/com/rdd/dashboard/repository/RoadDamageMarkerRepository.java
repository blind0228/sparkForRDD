package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.CountryStatsDto;
import com.rdd.dashboard.entity.RoadDamageMarker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadDamageMarkerRepository extends JpaRepository<RoadDamageMarker, Long> {
    Page<RoadDamageMarker> findByCountry(String country, Pageable pageable);
    Page<RoadDamageMarker> findAll(Pageable pageable);

    @Query(value = "SELECT m.* FROM road_damage_markers m " +
            "WHERE m.geom && ST_MakeEnvelope(?2, ?1, ?4, ?3, 4326) " +
            "AND EXISTS (SELECT 1 FROM world_landmask l WHERE ST_Intersects(m.geom, l.geom)) " +
            "LIMIT ?5", nativeQuery = true)
    List<RoadDamageMarker> findMarkersInViewport(double minLat, double minLng, double maxLat, double maxLng, int limit);

    @Query(value = "SELECT ST_Y(ST_Centroid(ST_Collect(m.geom))) as latitude, " +
            "ST_X(ST_Centroid(ST_Collect(m.geom))) as longitude, " +
            "COUNT(*) as count " +
            "FROM road_damage_markers m " +
            "WHERE m.geom && ST_MakeEnvelope(?2, ?1, ?4, ?3, 4326) " +
            "AND EXISTS (SELECT 1 FROM world_landmask l WHERE ST_Intersects(m.geom, l.geom)) " +
            "GROUP BY ST_SnapToGrid(m.geom, ?5)", nativeQuery = true)
    List<Object[]> findClustersInViewport(double minLat, double minLng, double maxLat, double maxLng, double gridSize);

    @Query(value = "SELECT * FROM road_damage_markers ORDER BY id DESC LIMIT ?1", nativeQuery = true)
    List<RoadDamageMarker> findRecentMarkers(int limit);

    @Query("SELECT new com.rdd.dashboard.dto.CountryStatsDto(rm.country, COUNT(rm)) " +
           "FROM RoadDamageMarker rm GROUP BY rm.country")
    List<CountryStatsDto> findCountryStats();

    @Query(value = "SELECT CAST(created_at AS DATE) as date, COUNT(*) as count " +
            "FROM road_damage_markers " +
            "GROUP BY CAST(created_at AS DATE) " +
            "ORDER BY date ASC", nativeQuery = true)
    List<Object[]> findDailyStats();
}
