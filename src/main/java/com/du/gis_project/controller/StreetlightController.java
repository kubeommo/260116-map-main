package com.du.gis_project.controller;

import com.du.gis_project.domain.entity.Streetlight;
import com.du.gis_project.repository.StreetlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class StreetlightController {

    private final StreetlightRepository streetlightRepository;

    @GetMapping("/streetlight")
    public List<Streetlight> getStreetlight() {
        return streetlightRepository.findAll();
    }
}
