package com.disaster.api.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class MemberUpdateRequest {

    private String name;
    private String gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private String tel;
    private String email;
}