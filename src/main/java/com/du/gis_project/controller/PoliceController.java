package com.du.gis_project.controller;

import com.du.gis_project.domain.entity.Police;
import com.du.gis_project.repository.PoliceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class PoliceController {
    private final PoliceRepository policeRepository;

    @GetMapping("/police")
    public List<Police> getPolice() {
        return policeRepository.findAll();
    }
}
