package com.rdd.dashboard.repository;

import com.rdd.dashboard.entity.RoadDamageMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadDamageMarkerRepository extends JpaRepository<RoadDamageMarker, Long> {
    List<RoadDamageMarker> findByCountry(String country);
}
