package com.disaster.api.guide.repository;

import com.disaster.api.guide.entity.EduGuide;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EduGuideRepository
        extends JpaRepository<EduGuide, Long> {

    /**
     * 검색어와 카테고리를 적용한 가이드 목록
     */
    @Query("""
        SELECT e
        FROM EduGuide e
        WHERE (
            :word IS NULL
            OR :word = ''
            OR LOWER(e.title) LIKE LOWER(CONCAT('%', :word, '%'))
            OR LOWER(e.summary) LIKE LOWER(CONCAT('%', :word, '%'))
            OR LOWER(e.tags) LIKE LOWER(CONCAT('%', :word, '%'))
        )
        AND (
            :category IS NULL
            OR :category = ''
            OR :category = '전체'
            OR e.category = :category
        )
        """)
    Page<EduGuide> search(
            @Param("word") String word,
            @Param("category") String category,
            Pageable pageable
    );

    /**
     * 조회수 1 증가
     */
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE EduGuide e
        SET e.hit = COALESCE(e.hit, 0) + 1
        WHERE e.no = :no
        """)
    int increaseHit(@Param("no") Long no);

    /**
     * 발행된 게시물 수
     *
     * 현재 프로젝트 status 기본값이 PUBLIC이므로
     * PUBLIC과 기존 Servlet 값인 '발행됨'을 모두 인식한다.
     */
    @Query("""
        SELECT COUNT(e)
        FROM EduGuide e
        WHERE e.status IN ('PUBLIC', '발행됨')
        """)
    Long countPublished();

    /**
     * 임시 저장 게시물 수
     */
    @Query("""
        SELECT COUNT(e)
        FROM EduGuide e
        WHERE e.status IN ('DRAFT', '임시저장')
        """)
    Long countDraft();

    /**
     * 전체 조회수 합계
     */
    @Query("""
        SELECT COALESCE(SUM(e.hit), 0)
        FROM EduGuide e
        """)
    Long sumHit();
}