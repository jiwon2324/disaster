package com.disaster.api.quiz.repository;

import com.disaster.api.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QQuizRepository
        extends JpaRepository<Quiz, Long>, QuerydslPredicateExecutor<Quiz> {
}