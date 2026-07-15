package com.disaster.api.qna.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QnaResponse {

    private Long no;
    private String title;
    private String content;
    private String writerId;
    private String writerName;
    private LocalDateTime writeDate;
    private Long hit;
    private Long refNo;
    private Long ordNo;
    private Long levNo;
    private Long parentNo;
    private String category;
    private String answerStatus;
}
