package com.du.gis_project.repository;

import com.du.gis_project.domain.entity.Streetlight;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreetlightRepository extends JpaRepository<Streetlight, Long> {
}