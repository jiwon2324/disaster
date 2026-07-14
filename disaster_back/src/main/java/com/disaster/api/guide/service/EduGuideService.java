package com.disaster.api.guide.service;

import com.disaster.api.guide.vo.EduGuideMetaVO;
import com.disaster.api.guide.vo.EduGuideVO;
import org.springframework.data.domain.Page;

public interface EduGuideService {

    Page<EduGuideVO> list(
            String word,
            String category,
            int page,
            int size
    );

    EduGuideVO view(Long no);

    EduGuideVO write(EduGuideVO vo);

    EduGuideVO update(Long no, EduGuideVO vo);

    void delete(Long no);

    EduGuideMetaVO getMetaData();
}