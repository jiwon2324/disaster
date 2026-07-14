package com.disaster.api.guide.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EduGuideMetaVO {

    private Long total;
    private Long published;
    private Long draft;
    private Long views;
}