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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
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
    }
}
