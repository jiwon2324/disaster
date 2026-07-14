package com.disaster.api.community.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommunityVO {
    private Long no;
    private String title;
    private String content;
    private String writer;
    private String pw;
    private LocalDateTime writeDate;
    private Long hit;
    private String fileName;
}
