package com.du.gis_project.repository;

import com.du.gis_project.domain.entity.Police;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PoliceRepository extends JpaRepository<Police, Long> {
}
