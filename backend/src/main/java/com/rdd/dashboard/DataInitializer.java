package com.rdd.dashboard;

import com.rdd.dashboard.entity.RoadDamageLabel;
import com.rdd.dashboard.entity.RoadDamageMarker;
import com.rdd.dashboard.entity.User;
import com.rdd.dashboard.repository.RoadDamageLabelRepository;
import com.rdd.dashboard.repository.RoadDamageMarkerRepository;
import com.rdd.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 애플리케이션 시작 시 기본 데이터(관리자 계정 및 샘플 도로 손상 데이터)를 생성한다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoadDamageMarkerRepository markerRepository;
    private final RoadDamageLabelRepository labelRepository;
    private final PasswordEncoder passwordEncoder;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Override
    public void run(String... args) {
        // 관리자 계정 생성
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("1234"))
                    .name("관리자")
                    .dept("시스템관리팀")
                    .role(User.Role.ADMIN)
                    .build());
            System.out.println("Default admin account created: admin@example.com / 1234");
        }

        // 샘플 도로 손상 데이터 생성
        if (markerRepository.count() == 0) {
            System.out.println("Seeding sample road damage data...");
            
            RoadDamageMarker marker1 = RoadDamageMarker.builder()
                    .country("South Korea")
                    .fileName("korea_001.txt")
                    .imageFileName("korea_001.jpg")
                    .latitude(37.5665)
                    .longitude(126.9780)
                    .totalDamageCount(2)
                    .dataBatch("2026-06-08")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .geom(geometryFactory.createPoint(new Coordinate(126.9780, 37.5665)))
                    .build();

            RoadDamageMarker marker2 = RoadDamageMarker.builder()
                    .country("Japan")
                    .fileName("japan_001.txt")
                    .imageFileName("japan_001.jpg")
                    .latitude(35.6895)
                    .longitude(139.6917)
                    .totalDamageCount(3)
                    .dataBatch("2026-06-08")
                    .createdAt(LocalDateTime.now().minusHours(5))
                    .geom(geometryFactory.createPoint(new Coordinate(139.6917, 35.6895)))
                    .build();

            RoadDamageMarker marker3 = RoadDamageMarker.builder()
                    .country("India")
                    .fileName("india_001.txt")
                    .imageFileName("india_001.jpg")
                    .latitude(28.6139)
                    .longitude(77.2090)
                    .totalDamageCount(1)
                    .dataBatch("2026-06-08")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .geom(geometryFactory.createPoint(new Coordinate(77.2090, 28.6139)))
                    .build();

            markerRepository.saveAll(List.of(marker1, marker2, marker3));

            labelRepository.saveAll(List.of(
                    RoadDamageLabel.builder().fileName("korea_001.txt").damageCode("D00").damageName("종방향 균열").xCenter(0.5).yCenter(0.5).bboxWidth(0.1).bboxHeight(0.1).build(),
                    RoadDamageLabel.builder().fileName("korea_001.txt").damageCode("D20").damageName("포트홀").xCenter(0.6).yCenter(0.6).bboxWidth(0.05).bboxHeight(0.05).build(),
                    RoadDamageLabel.builder().fileName("japan_001.txt").damageCode("D10").damageName("횡방향 균열").xCenter(0.3).yCenter(0.3).bboxWidth(0.2).bboxHeight(0.02).build(),
                    RoadDamageLabel.builder().fileName("japan_001.txt").damageCode("D10").damageName("횡방향 균열").xCenter(0.4).yCenter(0.4).bboxWidth(0.15).bboxHeight(0.02).build(),
                    RoadDamageLabel.builder().fileName("japan_001.txt").damageCode("D40").damageName("심각한 파손").xCenter(0.7).yCenter(0.2).bboxWidth(0.1).bboxHeight(0.1).build(),
                    RoadDamageLabel.builder().fileName("india_001.txt").damageCode("D20").damageName("포트홀").xCenter(0.2).yCenter(0.8).bboxWidth(0.08).bboxHeight(0.08).build()
            ));
            
            System.out.println("Sample road damage data seeded successfully.");
        }
    }
}
