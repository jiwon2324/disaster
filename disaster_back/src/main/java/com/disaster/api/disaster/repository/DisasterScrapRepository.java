package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterScrap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisasterScrapRepository extends JpaRepository<DisasterScrap, Long> {

    // 특정 회원의 스크랩 목록 조회 (최신순)
    List<DisasterScrap> findByIdOrderByScrapDateDesc(String id);

    // 스크랩 여부 확인 (회원 ID + 재난정보 PK)
    boolean existsByIdAndDisasterInfo_Id(String id, Long no);

    // 스크랩 삭제/취소 (회원 ID + 재난정보 PK)
    void deleteByIdAndDisasterInfo_Id(String id, Long no);
}