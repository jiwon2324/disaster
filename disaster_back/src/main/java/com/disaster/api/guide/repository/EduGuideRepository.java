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

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE EduGuide e
        SET e.hit = COALESCE(e.hit, 0) + 1
        WHERE e.no = :no
        """)
    int increaseHit(@Param("no") Long no);

    @Query("""
        SELECT COUNT(e)
        FROM EduGuide e
        WHERE e.status = 'PUBLIC'
        """)
    Long countPublished();

    @Query("""
        SELECT COUNT(e)
        FROM EduGuide e
        WHERE e.status = 'DRAFT'
        """)
    Long countDraft();

    @Query("""
        SELECT COALESCE(SUM(e.hit), 0)
        FROM EduGuide e
        """)
    Long sumHit();
}
