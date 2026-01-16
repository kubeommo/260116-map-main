package com.du.gis_project.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PopulationHeatmapDto {
    private Double lat;
    private Double lng;
    private Double weight;
}
