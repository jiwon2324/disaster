package com.disaster.api.checklist.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistMetaVO {

    private Long total;
    private Long ready;
    private Long notReady;
}