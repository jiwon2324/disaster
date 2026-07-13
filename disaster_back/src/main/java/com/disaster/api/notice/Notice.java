package com.disaster.api.notice;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "notice")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "notice_seq_gen")
    @SequenceGenerator(name = "notice_seq_gen", sequenceName = "notice_seq", allocationSize = 1)
    @Column(name = "no")
    private Long no;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "startDate")
    private LocalDateTime startDate = LocalDateTime.now(); // 기본값 sysdate

    @Column(name = "endDate")
    private LocalDateTime endDate = LocalDateTime.of(9999, 12, 30, 0, 0); // 기본값 '9999-12-30'

    @CreatedDate
    @Column(name = "writeDate", updatable = false)
    private LocalDateTime writeDate;

    @LastModifiedDate
    @Column(name = "updateDate")
    private LocalDateTime updateDate;
}