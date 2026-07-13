package com.disaster.api.quiz.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "quiz")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false, length = 100)
    private String ans;

    @Column(nullable = false, length = 50)
    private String writer;

    @CreatedDate
    @Column(name = "write_date", updatable = false)
    private LocalDateTime writeDate;

    private Long hit = 0L;

    @Column(name = "ref_no", nullable = false)
    private Long refNo;

    @Column(name = "ord_no", nullable = false)
    private Integer ordNo;

    @Column(name = "lev_no", nullable = false)
    private Integer levNo;

    @Column(name = "parent_no")
    private Long parentNo;
}