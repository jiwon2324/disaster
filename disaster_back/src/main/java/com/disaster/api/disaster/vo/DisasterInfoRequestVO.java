package com.disaster.api.disaster.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DisasterInfoRequestVO {
    private String title;
    private String content;
    private String location;
    private LocalDateTime disasterDate;
    private Long catid; // 속할 카테고리 ID
}