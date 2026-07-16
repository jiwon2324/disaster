package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterScrap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DisasterScrapRepository extends JpaRepository<DisasterScrap, Long> {

    // 특정 회원이 특정 재난글을 이미 스크랩했는지 조회 (중복 스크랩 방지용)
    // (DisasterScrap 엔티티의 필드명에 맞춰서 수정하여 사용하세요)
    boolean existsByIdAndNo(String Id, Long no);

    // 특정 회원이 스크랩한 목록 페이징 조회
    Page<DisasterScrap> findById(String Id, Pageable pageable);

    // 스크랩 취소(삭제)를 위한 단건 조회
    Optional<DisasterScrap> findByIdAndNo(String Id, Long no);
}