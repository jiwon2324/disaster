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

    @Id
    @Column(name = "id", length = 20, nullable = false)
    private String id;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "pw", length = 255, nullable = false)
    private String pw;

    @Column(name = "name", length = 30, nullable = false)
    private String name;

    @Column(name = "gender", length = 6, nullable = false)
    private String gender;

    @Column(name = "birth", nullable = false)
    private LocalDate birth;

    @Column(name = "tel", length = 13)
    private String tel;

    @Column(name = "email", length = 50, nullable = false)
    private String email;

    @CreatedDate
    @Column(name = "regDate", updatable = false)
    private LocalDateTime regDate;

    @Column(name = "conDate")
    private LocalDateTime conDate;

    @Builder.Default
    @Column(name = "status", length = 6, nullable = false)
    private String status = "정상";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade", referencedColumnName = "gradeNo")
    private Grade grade;
}