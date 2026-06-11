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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
    @DisplayName("도로 손상 목록을 페이징하여 조회한다.")
    void getDamages() throws Exception {
        // given
        RoadDamage damage = RoadDamage.builder()
                .id(1L)
                .damageType("Pothole")
                .latitude(37.1)
                .longitude(127.1)
                .imageX(150.0)
                .imageY(200.0)
                .capturedAt(LocalDateTime.now())
                .build();
        given(roadDamageRepository.findWithPagination(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(damage)));

        // when & then
        mockMvc.perform(get("/api/damages")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].damageType").value("Pothole"))
                .andExpect(jsonPath("$.content[0].latitude").value(37.1));
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
