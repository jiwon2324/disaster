package com.disaster.api.checklist.repository;

import com.disaster.api.checklist.entity.Checklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChecklistRepository
        extends JpaRepository<Checklist, Long> {

    Page<Checklist> findById(
            String id,
            Pageable pageable
    );

    @Query("""
        SELECT c
        FROM Checklist c
        WHERE c.id = :id
        AND (
            :word IS NULL
            OR :word = ''
            OR LOWER(c.name) LIKE LOWER(CONCAT('%', :word, '%'))
            OR LOWER(c.category) LIKE LOWER(CONCAT('%', :word, '%'))
            OR LOWER(c.memo) LIKE LOWER(CONCAT('%', :word, '%'))
        )
        AND (
            :category IS NULL
            OR :category = ''
            OR :category = '전체'
            OR c.category = :category
        )
        """)
    Page<Checklist> search(
            @Param("id") String id,
            @Param("word") String word,
            @Param("category") String category,
            Pageable pageable
    );

    long countById(String id);

    long countByIdAndIsReady(String id, String isReady);
}