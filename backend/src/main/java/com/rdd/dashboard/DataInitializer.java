package com.rdd.dashboard;

import com.rdd.dashboard.entity.User;
import com.rdd.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 시작 시 기본 데이터(관리자 계정)를 생성한다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    // private final RoadDamageRepository roadDamageRepository;
    private final PasswordEncoder passwordEncoder;

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

        /* 
        // 샘플 도로 손상 데이터 생성 - RoadDamage 엔티티 삭제됨
        if (roadDamageRepository.count() == 0) {
            roadDamageRepository.saveAll(List.of(
                RoadDamage.builder().damageType("D00").latitude(37.5665).longitude(126.9780).imageX(100.0).imageY(200.0).country("South Korea").capturedAt(LocalDateTime.now().minusHours(2)).build(),
                ...
            ));
            System.out.println("Sample road damage data created.");
        }
        */
    }
}
