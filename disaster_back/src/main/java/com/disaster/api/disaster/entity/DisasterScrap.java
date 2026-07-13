package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "DISASTER_SCRAP")
public class DisasterScrap {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "scrap_seq")
    @SequenceGenerator(name = "scrap_seq", sequenceName = "scrapNo_seq", allocationSize = 1)
    @Column(name = "scrap_no")
    private Long scrapNo;

    @Column(name = "id", nullable = false, length = 50)
    private String id; // 회원 ID 참조

    @Column(name = "no", nullable = false)
    private Long no; // DISASTERINFO 테이블 참조

    @CreatedDate
    @Column(name = "scrap_date", updatable = false)
    private LocalDateTime scrapDate; // 스크랩 일시 (자동 세팅)
}