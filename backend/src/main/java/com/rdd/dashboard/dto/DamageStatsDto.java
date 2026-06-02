package com.rdd.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DamageStatsDto {
    private String damageType;
    private String damageName;
    private Long count;

    public DamageStatsDto(String damageType, Long count) {
        this.damageType = damageType;
        this.count = count;
    }
}
