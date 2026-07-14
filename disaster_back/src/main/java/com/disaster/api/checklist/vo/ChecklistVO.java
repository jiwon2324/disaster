package com.disaster.api.checklist.vo;

import com.disaster.api.checklist.entity.Checklist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistVO {

    private Long no;
    private String id;
    private String name;
    private String category;
    private Integer quantity;
    private String unit;
    private String priority;
    private LocalDate expiryDate;
    private String memo;
    private String isReady;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;

    public static ChecklistVO fromEntity(Checklist entity) {
        return ChecklistVO.builder()
                .no(entity.getNo())
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .priority(entity.getPriority())
                .expiryDate(entity.getExpiryDate())
                .memo(entity.getMemo())
                .isReady(entity.getIsReady())
                .regDate(entity.getRegDate())
                .updateDate(entity.getUpdateDate())
                .build();
    }

    public Checklist toEntity() {
        Checklist entity = new Checklist();

        entity.setId(id);
        entity.setName(name);
        entity.setCategory(category);
        entity.setQuantity(quantity);
        entity.setUnit(unit);
        entity.setPriority(priority);
        entity.setExpiryDate(expiryDate);
        entity.setMemo(memo);
        entity.setIsReady(isReady);

        return entity;
    }
}