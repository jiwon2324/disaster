package com.disaster.api.disaster.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisasterCatAssignId implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long no;
    private Long catId;
}