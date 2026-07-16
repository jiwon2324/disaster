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

    // 1. 카테고리 ID 및 동적 키워드 검색을 포함하는 JPQL 페이징 쿼리
    // Oracle의 3중 서브쿼리 페이징을 작성할 필요 없이, Pageable 파라미터를 넘기면 JPA가 DB 방언에 맞춰 페이징을 자동 수행합니다.
    @Query("SELECT i FROM DisasterInfo i WHERE i.catID = :catID " +
            "AND (:word IS NULL OR :word = '' " +
            "     OR (:key LIKE '%t%' AND i.content LIKE %:word%) " +
            "     OR (:key LIKE '%l%' AND i.locationName LIKE %:word%))")
    Page<DisasterInfo> findDisasters(
            @Param("catID") int catID,
            @Param("key") String key,
            @Param("word") String word,
            Pageable pageable
    );
}