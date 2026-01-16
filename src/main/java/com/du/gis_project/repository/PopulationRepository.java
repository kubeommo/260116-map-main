package com.du.gis_project.repository;

import com.du.gis_project.domain.entity.Population;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopulationRepository extends JpaRepository<Population, Long> {
}
