package com.disaster.api.checklist.service;

import com.disaster.api.checklist.vo.ChecklistMetaVO;
import com.disaster.api.checklist.vo.ChecklistVO;
import org.springframework.data.domain.Page;

public interface ChecklistService {

    Page<ChecklistVO> list(
            String id,
            String word,
            String category,
            int page,
            int size
    );

    ChecklistVO view(Long no);

    ChecklistVO write(ChecklistVO vo);

    ChecklistVO update(Long no, ChecklistVO vo);

    ChecklistVO changeReady(Long no, String isReady);

    void delete(Long no);

    ChecklistMetaVO getMetaData(String id);
}