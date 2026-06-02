package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_markers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadDamageMarker {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String dataBatch;
    private String country;
    private String fileName;
    private String imageFileName;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Integer totalDamageCount;
    private LocalDateTime createdAt;
}
