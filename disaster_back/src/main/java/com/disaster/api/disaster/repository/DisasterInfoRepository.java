package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterInfoRepository extends JpaRepository<DisasterInfo, Long> {

    // 1. 단순 전체 리스트 조회 (카테고리별)
    List<DisasterInfo> findByCategoryCatidOrderByDisasterDateDesc(Long catid);

    // 2. 페이징 처리 리스트 조회 (카테고리별)
    Page<DisasterInfo> findByCategoryCatid(Long catid, Pageable pageable);

    // APIID 중복 수집 체크
    boolean existsByApiId(String apiId);
}