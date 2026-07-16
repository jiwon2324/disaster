package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "DISASTER_CATEGORY")
public class DisasterCategory {

    @Id
    @Column(name = "catid")
    private Long catId; // 카테고리 번호 (PK)

    @Column(name = "CAT_NAME", nullable = false, length = 100)
    private String catName; // 재난 종류명 (예: 지진, 태풍, 화재)

    @Column(name = "REGDATE", nullable = false, insertable = false, updatable = false)
    private LocalDateTime regDate;
}