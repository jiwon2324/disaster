package com.disaster.api.member.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponse {

    private String id;
    private String name;
    private String gender;
    private LocalDate birth;
    private String tel;
    private String email;
    private LocalDateTime regDate;
    private LocalDateTime conDate;
    private String status;
    private Integer gradeNo;
    private String gradeName;
}