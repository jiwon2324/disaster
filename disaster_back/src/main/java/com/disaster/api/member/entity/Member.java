package com.disaster.api.member.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Check(constraints = "gender in ('남자', '여자')")
public class Member {

    // 아이디: VARCHAR2(20), PK
    @Id
    @Column(name = "id", length = 20, nullable = false)
    private String id;

    // JSON 응답으로 비밀번호가 노출되지 않도록 설정
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "pw", length = 20, nullable = false)
    private String pw;

    // 이름: VARCHAR2(30)
    @Column(name = "name", length = 30, nullable = false)
    private String name;

    // 성별: 남자 또는 여자
    @Column(name = "gender", length = 6, nullable = false)
    private String gender;

    // 생년월일
    @Column(name = "birth", nullable = false)
    private LocalDate birth;

    // 연락처
    @Column(name = "tel", length = 13)
    private String tel;

    // 이메일
    @Column(name = "email", length = 50, nullable = false)
    private String email;

    // 가입일
    @CreatedDate
    @Column(name = "regDate", updatable = false)
    private LocalDateTime regDate;

    // 최근 접속일
    // 로그인 성공 시 Service에서 LocalDateTime.now()로 변경
    @Column(name = "conDate")
    private LocalDateTime conDate;

    // 정상, 강퇴, 탈퇴, 휴면
    @Builder.Default
    @Column(name = "status", length = 6, nullable = false)
    private String status = "정상";

    // 회원 등급
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade", referencedColumnName = "gradeNo")
    private Grade grade;
}