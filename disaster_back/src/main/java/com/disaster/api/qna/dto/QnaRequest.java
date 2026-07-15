package com.disaster.api.qna.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QnaRequest {

    private String title;
    private String content;
    private String category;
}
