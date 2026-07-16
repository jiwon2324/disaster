package com.disaster.api.disaster.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "DISASTER_CAT_ASSIGN")
@IdClass(DisasterCatAssignId.class) // 별도 파일로 분리된 public 클래스를 매핑
public class DisasterCatAssign {

    @Id
    @Column(name = "no")
    private Long no; // DISASTERINFO 참조

    @Id
    @Column(name = "catid")
    private Long catId; // DISASTER_CATEGORY 참조
}