package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "DISASTERINFO")
public class DisasterInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "disaster_seq")
    @SequenceGenerator(name = "disaster_seq", sequenceName = "DISASTER_SEQ", allocationSize = 1)
    @Column(name = "no")
    private Long no;

    @Column(name = "summary", nullable = false, length = 2)
    private String summary; // DISASTER_CATEGORY 참조 외래키 역할

    @Column(name = "CATID", nullable = false)
    private Integer catId; // 카테고리 번호 (1: 피해/폭발, 2: 지진/해일 등)

    @Column(name = "APIID", length = 100)
    private String apiId;

    @Column(name = "title", length = 300)
    private String title;

    @Column(name = "locationname", length = 300)
    private String locationName;

    @Column(name = "createdate", length = 50)
    private String createDate; // 재난 발생 시간 (문자열 포맷)

    @Column(name = "dangerlevel")
    private Integer dangerLevel = 1; // 기본값 1

    @Lob
    @Column(name = "Content", columnDefinition = "clob")
    private String content;

    @Lob
    @Column(name = "Detailcontent", columnDefinition = "clob")
    private String detailContent;

    @Column(name = "Latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "Longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @CreatedDate
    @Column(name = "Writedate", updatable = false)
    private LocalDateTime writeDate; // DB 등록일 (자동 세팅)
}
