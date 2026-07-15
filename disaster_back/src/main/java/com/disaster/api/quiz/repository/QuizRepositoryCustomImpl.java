package com.disaster.api.quiz.repository;

import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.disaster.api.quiz.entity.Quiz;
import com.disaster.api.quiz.entity.QQuiz;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class QuizRepositoryCustomImpl implements QuizRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QQuizRepository qQuizRepository;

    QQuiz quiz = QQuiz.quiz;

    @Override
    public List<Tuple> getList() {
        return queryFactory
                .select(
                        quiz.no,
                        quiz.title,
                        quiz.writer,
                        quiz.hit,
                        quiz.writeDate
                )
                .from(quiz)
                .where(quiz.levNo.eq(0))
                .orderBy(quiz.no.desc())
                .fetch();
    }

    @Override
    public Tuple getQuiz(Long no) {
        return queryFactory
                .select(
                        quiz.no,
                        quiz.title,
                        quiz.content,
                        quiz.ans,
                        quiz.writer,
                        quiz.writeDate,
                        quiz.hit
                )
                .from(quiz)
                .where(quiz.no.eq(no))
                .fetchOne();
    }

    @Override
    public String getExplain(Long no) {
        return queryFactory
                .select(quiz.content)
                .from(quiz)
                .where(quiz.parentNo.eq(no).and(quiz.levNo.eq(1)))
                .fetchOne();
    }

    @Override
    public Long increaseHit(Long no) {
        return queryFactory
                .update(quiz)
                .set(quiz.hit, quiz.hit.add(1))
                .where(quiz.no.eq(no))
                .execute();
    }

    @Override
    public Quiz writeQuiz(Quiz quizData) {
        return qQuizRepository.save(quizData);
    }

    @Override
    public Long updateQuiz(String title, String content, String ans, Long no) {
        return queryFactory
                .update(quiz)
                .set(quiz.title, title)
                .set(quiz.content, content)
                .set(quiz.ans, ans)
                .where(quiz.no.eq(no))
                .execute();
    }

    @Override
    public Long updateExplain(String title, String content, Long parentNo) {
        return queryFactory
                .update(quiz)
                .set(quiz.title, title)
                .set(quiz.content, content)
                .where(quiz.parentNo.eq(parentNo).and(quiz.levNo.eq(1)))
                .execute();
    }

    @Override
    public void deleteQuiz(Long no) {
        // 부모글과 해당 부모를 둔 자식글(해설) 일괄 제거
        queryFactory.delete(quiz).where(quiz.no.eq(no).or(quiz.parentNo.eq(no))).execute();
    }
}