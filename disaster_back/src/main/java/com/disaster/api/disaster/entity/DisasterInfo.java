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

    @Column(name = "api_id", unique = true)
    private String apiId; // 외부 API ID (중복 체크용)

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String location;

    private LocalDateTime disasterDate;

    // 카테고리와의 연관관계 (FK: category_id 또는 catid)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catid")
    private DisasterCategory category;
}