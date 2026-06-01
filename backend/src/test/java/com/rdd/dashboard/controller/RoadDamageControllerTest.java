package com.rdd.dashboard.controller;

import com.rdd.dashboard.config.SecurityConfig;
import com.rdd.dashboard.dto.DamageStatsDto;
import com.rdd.dashboard.entity.RoadDamage;
import com.rdd.dashboard.repository.RoadDamageRepository;
import com.rdd.dashboard.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoadDamageController.class)
@Import(SecurityConfig.class)
class RoadDamageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoadDamageRepository roadDamageRepository;

    @MockBean
    private UserRepository userRepository;

    @Test
    @WithMockUser
    @DisplayName("모든 도로 손상 목록을 조회한다.")
    void getAllDamages() throws Exception {
        // given
        RoadDamage damage = RoadDamage.builder()
                .id(1L)
                .damageType("Pothole")
                .latitude(37.1)
                .longitude(127.1)
                .capturedAt(LocalDateTime.now())
                .build();
        given(roadDamageRepository.findAll()).willReturn(List.of(damage));

        // when & then
        mockMvc.perform(get("/api/damages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].damageType").value("Pothole"))
                .andExpect(jsonPath("$[0].latitude").value(37.1));
    }

    @Test
    @WithMockUser
    @DisplayName("손상 유형별 통계를 조회한다.")
    void getDamageStats() throws Exception {
        // given
        DamageStatsDto stats = new DamageStatsDto("Pothole", 5L);
        given(roadDamageRepository.findAllDamageStats()).willReturn(List.of(stats));

        // when & then
        mockMvc.perform(get("/api/damages/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].damageType").value("Pothole"))
                .andExpect(jsonPath("$[0].count").value(5));
    }
}
