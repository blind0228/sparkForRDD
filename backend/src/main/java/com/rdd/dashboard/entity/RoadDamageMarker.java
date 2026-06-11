package com.rdd.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_damage_markers", indexes = {
    @Index(name = "idx_marker_file_name", columnList = "fileName")
})
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

    @JsonIgnore
    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point geom;
}
