package com.disaster.api.checklist.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "my_checklist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;

    @Column(name = "id", nullable = false, length = 20)
    private String id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", length = 50)
    private String category;

    @Builder.Default
    @Column(name = "is_ready", nullable = false, length = 1)
    private String isReady = "N";

    @Column(name = "memo", length = 1000)
    private String memo;

    @Column(
            name = "reg_date",
            nullable = false,
            updatable = false,
            insertable = false
    )
    private LocalDateTime regDate;

    @PrePersist
    public void prePersist() {

        if (this.isReady == null || this.isReady.isBlank()) {
            this.isReady = "N";
        }
    }
}