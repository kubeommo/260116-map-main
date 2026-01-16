package com.du.gis_project.controller;

import com.du.gis_project.domain.entity.CCTV;
import com.du.gis_project.repository.CCTVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CCTVController {

    private final CCTVRepository cctvRepository;

    @GetMapping("/cctv")
    public List<CCTV> getCCTV() {
        return cctvRepository.findAll();
    }
}
