package com.disaster.api.quiz.service;

import com.querydsl.core.Tuple;
import com.disaster.api.quiz.entity.Quiz;
import com.disaster.api.quiz.repository.QuizRepositoryCustom;
import com.disaster.api.quiz.vo.QuizVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {

    private final QuizRepositoryCustom quizRepositoryCustom;

    @Override
    public List<QuizVO> list() {
        List<Tuple> tupleList = quizRepositoryCustom.getList();
        List<QuizVO> list = new ArrayList<>();
        for (Tuple tuple : tupleList) {
            QuizVO vo = new QuizVO();
            vo.setNo(tuple.get(0, Long.class));
            vo.setTitle(tuple.get(1, String.class));
            vo.setWriter(tuple.get(2, String.class));
            vo.setHit(tuple.get(3, Long.class));
            vo.setWriteDate(tuple.get(4, LocalDateTime.class));
            list.add(vo);
        }
        return list;
    }

    @Override
    @Transactional
    public QuizVO view(Long no, Integer inc) {
        if (inc == 1) quizRepositoryCustom.increaseHit(no);
        Tuple tuple = quizRepositoryCustom.getQuiz(no);

        QuizVO vo = new QuizVO();
        vo.setNo(tuple.get(0, Long.class));
        vo.setTitle(tuple.get(1, String.class));
        vo.setContent(tuple.get(2, String.class));
        vo.setAns(tuple.get(3, String.class));
        vo.setWriter(tuple.get(4, String.class));
        vo.setWriteDate(tuple.get(5, LocalDateTime.class));
        vo.setHit(tuple.get(6, Long.class));
        vo.setExplain(quizRepositoryCustom.getExplain(no));
        return vo;
    }

    @Override
    @Transactional
    public void write(QuizVO vo) {
        // [1단계] 문제 등록
        Quiz question = new Quiz();
        question.setTitle(vo.getTitle());
        question.setContent(vo.getContent());
        question.setAns(vo.getAns());
        question.setWriter(vo.getWriter());
        question.setRefNo(0L); // 임시값
        question.setOrdNo(1);
        question.setLevNo(0);

        // 영속성 컨텍스트에 저장하여 실제 DB 시퀀스/AUTO_INCREMENT 번호(no)를 즉시 부여받습니다.
        Quiz savedQuestion = quizRepositoryCustom.writeQuiz(question);

        // 생성된 고유 키(no)를 refNo로 지정해 줍니다.
        savedQuestion.setRefNo(savedQuestion.getNo());
        quizRepositoryCustom.writeQuiz(savedQuestion); // 영속 데이터 업데이트

        // [2단계] 해설 등록
        Quiz explanation = new Quiz();
        explanation.setTitle("[해설] " + vo.getTitle());
        explanation.setContent(vo.getExplain());
        explanation.setAns(" ");
        explanation.setWriter(vo.getWriter());
        explanation.setRefNo(savedQuestion.getNo());
        explanation.setOrdNo(2);
        explanation.setLevNo(1);

        explanation.setParentNo(savedQuestion.getNo());

        quizRepositoryCustom.writeQuiz(explanation);
    }

    @Override
    @Transactional
    public void update(QuizVO vo) {
        quizRepositoryCustom.updateQuiz(vo.getTitle(), vo.getContent(), vo.getAns(), vo.getNo());
        quizRepositoryCustom.updateExplain("[해설] " + vo.getTitle(), vo.getExplain(), vo.getNo());
    }

    @Override
    @Transactional
    public void delete(Long no) {
        quizRepositoryCustom.deleteQuiz(no);
    }
}
