package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DisasterListRepository extends JpaRepository<DisasterInfo, Long> {

    // 1. 카테고리 할당 테이블(DisasterCatAssign)과 조인하여 조건에 맞는 재난 정보를 가져오는 페이징 쿼리
    @Query("SELECT i FROM DisasterInfo i " +
            "WHERE EXISTS (" +
            "    SELECT 1 FROM DisasterCatAssign a " +
            "    WHERE a.no = i.no AND a.catId = :catId" +
            ") " +
            "AND (:word IS NULL OR :word = '' " +
            "     OR (:key LIKE '%t%' AND i.content LIKE %:word%) " +
            "     OR (:key LIKE '%l%' AND i.locationName LIKE %:word%))")
    Page<DisasterInfo> findDisasters(
            @Param("catId") Long catId, // DisasterCatAssign의 catId 타입과 일치하게 Long으로 변경
            @Param("key") String key,
            @Param("word") String word,
            Pageable pageable
    );
}