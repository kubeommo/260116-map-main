package com.du.gis_project.controller;

import com.du.gis_project.domain.entity.Population;
import com.du.gis_project.repository.PopulationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class PopulationController {

    private final PopulationRepository populationRepository;

    @GetMapping("/population")
    public List<Population> getAllPopulation() {
        return populationRepository.findAll();
    }
}
