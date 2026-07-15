package com.disaster.api.quiz.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuizVO {
    private Long no;
    private String title;
    private String content;
    private String ans;
    private String writer;
    private LocalDateTime writeDate;
    private Long hit;
    private Long refNo;
    private Integer ordNo;
    private Integer levNo;
    private Long parentNo;
    private String explain;
}