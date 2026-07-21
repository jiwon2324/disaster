package com.disaster.api.disaster.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterScrapVO {

    private Long scrapNo;       // 스크랩 PK
    private String id;          // 회원 ID
    private Long no;            // 재난 정보 PK (DisasterInfo no)

    // 목록 표시용 재난 상세 정보
    private String title;
    private String content;
    private String location;
    private LocalDateTime disasterDate;
    private String categoryName;
    private LocalDateTime scrapDate; // 스크랩 일시
}