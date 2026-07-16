package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DisasterCategoryRepository extends JpaRepository<DisasterInfo, Long> {
    // APIID 중복 수집 체크를 위한 메소드
    boolean existsByApiId(String apiId);
}