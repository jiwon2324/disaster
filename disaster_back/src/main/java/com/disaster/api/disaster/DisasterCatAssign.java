package com.disaster.api.disaster;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Entity
@Data
@Table(name = "DISASTER_CAT_ASSIGN")
@IdClass(DisasterCatAssignId.class) // 복합키 식별자 클래스 지정
public class DisasterCatAssign {

    @Id
    @Column(name = "no")
    private Long no; // DISASTERINFO 참조

    @Id
    @Column(name = "catid")
    private Long catId; // DISASTER_CATEGORY 참조
}

// 복합키를 위한 식별자 클래스 (동일 패키지 또는 내부 클래스로 선언)
@Data
class DisasterCatAssignId implements Serializable {
    private Long no;
    private Long catId;
}
