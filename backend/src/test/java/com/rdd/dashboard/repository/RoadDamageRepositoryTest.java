package com.rdd.dashboard.repository;

import com.rdd.dashboard.entity.RoadDamage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RoadDamageRepositoryTest {

    @Autowired
    private RoadDamageRepository roadDamageRepository;

    @Test
    @DisplayName("도로 손상 정보를 저장하고 조회한다.")
    void saveAndFindRoadDamage() {
        // given
        RoadDamage roadDamage = RoadDamage.builder()
                .damageType("Pothole")
                .latitude(37.123456)
                .longitude(127.123456)
                .capturedAt(LocalDateTime.now())
                .build();

        // when
        RoadDamage savedDamage = roadDamageRepository.save(roadDamage);

        // then
        assertThat(savedDamage.getId()).isNotNull();
        Optional<RoadDamage> foundDamage = roadDamageRepository.findById(savedDamage.getId());
        assertThat(foundDamage).isPresent();
        assertThat(foundDamage.get().getDamageType()).isEqualTo("Pothole");
    }
}
