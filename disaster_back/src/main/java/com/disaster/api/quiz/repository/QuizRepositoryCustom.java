package com.disaster.api.quiz.repository;

import com.querydsl.core.Tuple;
import com.disaster.api.quiz.entity.Quiz;
import java.util.List;

public interface QuizRepositoryCustom {
    List<Tuple> getList();
    Tuple getQuiz(Long no);
    String getExplain(Long no);
    Long increaseHit(Long no);
    Quiz writeQuiz(Quiz quiz);
    Long updateQuiz(String title, String content, String ans, Long no);
    Long updateExplain(String title, String content, Long parentNo);
    void deleteQuiz(Long no);
}
