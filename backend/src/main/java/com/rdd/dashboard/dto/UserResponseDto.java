package com.rdd.dashboard.dto;

import com.rdd.dashboard.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 정보 응답 DTO (비밀번호 제외)
 */
@Getter
@Setter
@NoArgsConstructor
public class UserResponseDto {
    private Long id;
    private String email;
    private String name;
    private String dept;
    private User.Role role;
    private String joinedAt;

    public UserResponseDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.dept = user.getDept();
        this.role = user.getRole();
        this.joinedAt = user.getJoinedAt() != null ? user.getJoinedAt().toString() : null;
    }
}
