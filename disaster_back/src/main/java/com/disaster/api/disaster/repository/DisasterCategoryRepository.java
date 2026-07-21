package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DisasterCategoryRepository extends JpaRepository<DisasterCategory, Long> {
    Optional<DisasterCategory> findByCatName(String catName);
}