package com.rdd.dashboard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 등록 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class UserRegisterRequestDto {
    private String email;
    private String password;
    private String name;
    private String dept;
}
