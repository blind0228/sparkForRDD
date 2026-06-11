package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_labels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadDamageLabel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String dataBatch;
    private String country;
    private String fileName;
    private String damageCode;
    private String damageName;
    private Integer classId;
    private Double xCenter;
    private Double yCenter;
    private Double bboxWidth;
    private Double bboxHeight;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
}
