package com.rdd.dashboard.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_labels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadDamageLabel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "data_batch")
    private String dataBatch;
    
    private String country;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "damage_code")
    private String damageCode;
    
    @Column(name = "damage_name")
    private String damageName;
    
    @Column(name = "class_id")
    private Integer classId;
    
    @Column(name = "x_center")
    @JsonProperty("xCenter")
    private Double xCenter;
    
    @Column(name = "y_center")
    @JsonProperty("yCenter")
    private Double yCenter;
    
    @Column(name = "bbox_width")
    private Double bboxWidth;
    
    @Column(name = "bbox_height")
    private Double bboxHeight;
    
    private Double latitude;
    private Double longitude;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
