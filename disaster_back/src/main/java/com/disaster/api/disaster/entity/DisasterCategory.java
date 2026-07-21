package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "DISASTER_CATEGORY")
public class DisasterCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "catid")
    private Long catid; // 카테고리 번호 (PK)

    @Column(name = "cat_name", nullable = false, length = 100)
    private String catName; // 재난 종류명 (예: 지진, 태풍, 화재)
}