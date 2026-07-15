package com.disaster.api.quiz.service;

import com.disaster.api.quiz.vo.QuizVO;
import java.util.List;

public interface QuizService {
    List<QuizVO> list();
    QuizVO view(Long no, Integer inc);
    void write(QuizVO vo);
    void update(QuizVO vo);
    void delete(Long no);
}