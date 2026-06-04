package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.CountryStatsDto;
import com.rdd.dashboard.entity.RoadDamageMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadDamageMarkerRepository extends JpaRepository<RoadDamageMarker, Long> {
    List<RoadDamageMarker> findByCountry(String country);

    @Query(value = "SELECT * FROM road_damage_markers " +
            "WHERE geom && ST_MakeEnvelope(?2, ?1, ?4, ?3, 4326) " +
            "LIMIT ?5", nativeQuery = true)
    List<RoadDamageMarker> findMarkersInViewport(double minLat, double minLng, double maxLat, double maxLng, int limit);

    @Query("SELECT new com.rdd.dashboard.dto.CountryStatsDto(rm.country, COUNT(rm)) " +
           "FROM RoadDamageMarker rm GROUP BY rm.country")
    List<CountryStatsDto> findCountryStats();
}
