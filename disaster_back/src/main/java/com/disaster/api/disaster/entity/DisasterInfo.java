package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "DISASTER_INFO")
public class DisasterInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_id", unique = true, length = 255)
    private String apiId; // 외부 API ID (중복 체크용)

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "disaster_date")
    private LocalDateTime disasterDate;

    @Column(columnDefinition = "TEXT")
    private String location;

    private String title;

    // 카테고리와의 연관관계 (FK: catid)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catid")
    private DisasterCategory category;

    @Column(name = "dangerlevel")
    private Integer dangerLevel; // 위험도 (INT)

    @Column(name = "detailcontent", columnDefinition = "TEXT")
    private String detailContent; // 상세 내용 (TEXT)

    @Column(name = "latitude", columnDefinition = "DECIMAL(10,7)")
    private Double latitude; // 위도 (DECIMAL 10,7)

    @Column(name = "longitude", columnDefinition = "DECIMAL(10,7)")
    private Double longitude; // 경도 (DECIMAL 10,7)

    @Column(name = "writedate")
    private LocalDateTime writeDate; // 작성일시 (DATETIME)
}