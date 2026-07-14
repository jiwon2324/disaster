package com.disaster.api.guide.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "edu_guide")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EduGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "writer", nullable = false, length = 100)
    private String writer;

    @Column(name = "summary", nullable = false, length = 1000)
    private String summary;

    @Lob
    @Column(
            name = "content",
            nullable = false,
            columnDefinition = "LONGTEXT"
    )
    private String content;

    @Column(name = "tags", length = 500)
    private String tags;

    @Builder.Default
    @Column(name = "hit", nullable = false)
    private Long hit = 0L;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PUBLIC";

    @Column(
            name = "reg_date",
            nullable = false,
            updatable = false,
            insertable = false
    )
    private LocalDateTime regDate;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @PrePersist
    public void prePersist() {
        if (this.hit == null) {
            this.hit = 0L;
        }

        if (this.status == null || this.status.isBlank()) {
            this.status = "PUBLIC";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updateDate = LocalDateTime.now();
    }
}