package com.disaster.api.member.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberVO {

    private String id;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String pw;

    private String name;

    private String gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private String tel;

    private String email;

    private LocalDateTime regDate;

    private LocalDateTime conDate;

    private String status;
}