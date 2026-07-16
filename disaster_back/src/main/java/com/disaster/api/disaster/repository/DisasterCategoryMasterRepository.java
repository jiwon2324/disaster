package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisasterCategoryMasterRepository extends JpaRepository<DisasterCategory, Long> {
}
