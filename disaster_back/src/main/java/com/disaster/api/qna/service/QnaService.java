package com.disaster.api.qna.service;

import com.disaster.api.qna.dto.QnaRequest;
import com.disaster.api.qna.dto.QnaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QnaService {

    Page<QnaResponse> getQuestionList(
            String keyword,
            String category,
            Pageable pageable
    );

    List<QnaResponse> getThread(Long no);

    QnaResponse createQuestion(QnaRequest request, String loginId);

    QnaResponse updateQna(Long no, QnaRequest request, String loginId);

    void deleteQna(Long no, String loginId);

    QnaResponse createAnswer(Long questionNo, QnaRequest request, String loginId);
}
