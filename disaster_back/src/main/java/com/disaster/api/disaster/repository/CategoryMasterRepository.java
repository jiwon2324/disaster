package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryMasterRepository extends JpaRepository<DisasterCategory, Long> {
    // 기본적으로 findAll(), findById(), save(), deleteById()가 자동 제공
}