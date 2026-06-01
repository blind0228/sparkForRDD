package com.rdd.dashboard.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("인증되지 않은 사용자는 API 접근 시 401 또는 302 리다이렉트가 발생한다.")
    void unauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/damages"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("관리자 계정으로 로그인이 성공한다.")
    void loginSuccess() throws Exception {
        mockMvc.perform(formLogin("/api/login").user("admin@example.com").password("1234"))
                .andExpect(authenticated().withUsername("admin@example.com"));
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인 시 실패한다.")
    void loginFailure() throws Exception {
        mockMvc.perform(formLogin("/api/login").user("admin@example.com").password("wrong"))
                .andExpect(unauthenticated());
    }

    @Test
    @WithMockUser(username = "admin@example.com")
    @DisplayName("인증된 사용자는 API에 접근할 수 있다.")
    void authenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/damages"))
                .andExpect(status().isOk());
    }
}
