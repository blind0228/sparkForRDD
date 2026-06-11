package com.rdd.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CountryDamageTypeStatsDto {
    private String country;
    private String damageType;
    private Long count;
}
