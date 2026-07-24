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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scrap_no")
    private Long scrapNo;

    @Column(name = "id", nullable = false, length = 50)
    private String id; // 회원 ID 참조

    // 스크랩 대상 재난 정보
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disaster_info_id", nullable = false)
    private DisasterInfo disasterInfo;

    @Column(name = "no", nullable = false)
    private Long no; // 재난 번호 (disasterInfo.id 값)

    @Column(name = "scrap_date", nullable = false, updatable = false)
    private LocalDateTime scrapDate;

    @PrePersist
    public void prePersist() {
        this.scrapDate = LocalDateTime.now();
    }
}

