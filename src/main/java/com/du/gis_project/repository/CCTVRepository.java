package com.du.gis_project.repository;

import com.du.gis_project.domain.entity.CCTV;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CCTVRepository extends JpaRepository<CCTV, Long> {
}
