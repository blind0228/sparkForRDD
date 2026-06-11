package com.rdd.dashboard.controller;

import com.rdd.dashboard.dto.UserRegisterRequestDto;
import com.rdd.dashboard.dto.UserResponseDto;
import com.rdd.dashboard.entity.User;
import com.rdd.dashboard.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 관리 및 회원가입을 담당하는 컨트롤러
 */
@Tag(name = "User API", description = "사용자 관리 및 회원가입 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 신규 사용자를 등록한다 (회원가입).
     */
    @Operation(summary = "회원가입", description = "신규 사용자를 등록합니다. 기본 역할은 USER입니다.")
    @PostMapping("/register")
    public UserResponseDto register(@RequestBody UserRegisterRequestDto request) {
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .dept(request.getDept())
                .role(User.Role.USER)
                .build();
        
        return new UserResponseDto(userRepository.save(user));
    }

    /**
     * 전체 사용자 목록을 조회한다.
     */
    @Operation(summary = "사용자 목록 조회", description = "시스템에 등록된 모든 사용자 정보를 반환합니다.")
    @GetMapping
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * 사용자를 삭제한다.
     */
    @Operation(summary = "사용자 삭제", description = "ID를 기반으로 특정 사용자를 시스템에서 제거합니다.")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}
