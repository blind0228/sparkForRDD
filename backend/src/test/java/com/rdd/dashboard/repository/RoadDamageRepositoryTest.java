package com.rdd.dashboard.repository;

import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

@DataJpaTest
class RoadDamageRepositoryTest {

    @Autowired
    private RoadDamageRepository roadDamageRepository;

    @Test
    @DisplayName("도로 손상 정보를 저장하고 조회한다.")
    void saveAndFindRoadDamage() {
        // given
        RoadDamage damage = RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.5)
                .longitude(127.0)
                .imageX(100.0)
                .imageY(100.0)
                .capturedAt(LocalDateTime.now())
                .build();

        // when
        RoadDamage savedDamage = roadDamageRepository.save(damage);

        // then
        assertThat(savedDamage.getId()).isNotNull();
        Optional<RoadDamage> foundDamage = roadDamageRepository.findById(savedDamage.getId());
        assertThat(foundDamage).isPresent();
        assertThat(foundDamage.get().getDamageType()).isEqualTo("Pothole");
    }

    @Test
    @DisplayName("손상 유형별 통계를 조회한다.")
    void findDamageStats() {
        // given
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.5)
                .longitude(127.0)
                .imageX(100.0)
                .imageY(100.0)
                .capturedAt(LocalDateTime.now())
                .build());
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.5)
                .longitude(127.0)
                .imageX(100.0)
                .imageY(100.0)
                .capturedAt(LocalDateTime.now())
                .build());
        roadDamageRepository.save(RoadDamage.builder()
                .damageType("Crack")
                .latitude(37.3)
                .longitude(127.3)
                .imageX(200.0)
                .imageY(200.0)
                .capturedAt(LocalDateTime.now())
                .build());

        // when
        List<DamageStatsDto> stats = roadDamageRepository.findAllDamageStats();

        // then
        assertThat(stats).hasSize(2);
        assertThat(stats).extracting("damageType", "count")
                .containsExactlyInAnyOrder(
                        tuple("Pothole", 2L),
                        tuple("Crack", 1L)
                );
    }
}
