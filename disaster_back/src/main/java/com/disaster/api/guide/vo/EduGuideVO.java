package com.disaster.api.guide.vo;

import com.disaster.api.guide.entity.EduGuide;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EduGuideVO {

    private Long no;
    private String title;
    private String category;
    private String writer;
    private String summary;
    private String content;
    private String tags;
    private Long hit;
    private String status;
    private LocalDateTime regDate;
    private LocalDateTime updateDate;

    /**
     * Entity를 VO로 변환
     */
    public static EduGuideVO fromEntity(EduGuide entity) {
        return EduGuideVO.builder()
                .no(entity.getNo())
                .title(entity.getTitle())
                .category(entity.getCategory())
                .writer(entity.getWriter())
                .summary(entity.getSummary())
                .content(entity.getContent())
                .tags(entity.getTags())
                .hit(entity.getHit())
                .status(entity.getStatus())
                .regDate(entity.getRegDate())
                .updateDate(entity.getUpdateDate())
                .build();
    }

    /**
     * 등록 시 VO를 Entity로 변환
     */
    public EduGuide toEntity() {
        EduGuide entity = new EduGuide();

        entity.setTitle(title);
        entity.setCategory(category);
        entity.setWriter(writer);
        entity.setSummary(summary);
        entity.setContent(content);
        entity.setTags(tags);
        entity.setStatus(status);

        return entity;
    }

    /**
     * 태그 문자열을 배열로 변환
     */
    public String[] getTagList() {
        if (tags == null || tags.isBlank()) {
            return new String[0];
        }

        return tags.split("\\s*,\\s*");
    }
}