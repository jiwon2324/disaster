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
public class DisasterInfoVO {

    private Long id;
    private String apiId;
    private String title;
    private String content;
    private String location;
    private LocalDateTime disasterDate;

    // 카테고리 정보
    private Long catid;
    private String catName;
}