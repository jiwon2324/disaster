package com.disaster.api.qna.entity;

import com.disaster.api.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "qna")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Qna {

    // 글번호: qna_seq 사용
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "qna_seq_generator"
    )
    @SequenceGenerator(
            name = "qna_seq_generator",
            sequenceName = "qna_seq",
            allocationSize = 1
    )
    @Column(name = "no")
    private Long no;

    // 제목
    @Column(name = "title", length = 300, nullable = false)
    private String title;

    // 내용
    @Column(name = "content", length = 2000, nullable = false)
    private String content;

    // 작성 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id",
            referencedColumnName = "id",
            nullable = false
    )
    private Member member;

    // 작성일
    @CreatedDate
    @Column(name = "writeDate", updatable = false)
    private LocalDateTime writeDate;

    // 조회수
    @Builder.Default
    @Column(name = "hit")
    private Long hit = 0L;

    // 관련 글번호
    // 질문 글은 자신의 번호, 답변 글은 질문 글의 번호
    @Column(name = "refNo")
    private Long refNo;

    // 출력 순서
    @Builder.Default
    @Column(name = "ordNo")
    private Long ordNo = 0L;

    // 답변 들여쓰기 깊이
    @Builder.Default
    @Column(name = "levNo")
    private Long levNo = 0L;

    // 부모 글번호
    @Column(name = "parentNo")
    private Long parentNo;

    // 추후 개발: QnA 카테고리 분류
    // 예: 이용문의, 계정문의, 재난정보, 오류신고, 기타
    @Builder.Default
    @Column(name = "category", length = 30, nullable = false)
    private String category = "기타";
}