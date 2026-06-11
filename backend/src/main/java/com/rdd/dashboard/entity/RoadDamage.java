package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 도로 손상 정보를 담는 엔티티
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadDamage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 손상 유형 (예: Pothole, Crack 등)
     */
    @Column(nullable = false)
    private String damageType;

    /**
     * 위도
     */
    @Column(nullable = false)
    private Double latitude;

    /**
     * 경도
     */
    @Column(nullable = false)
    private Double longitude;

    /**
     * 캡처된 시간
     */
    @Column(nullable = false)
    private LocalDateTime capturedAt;
}
