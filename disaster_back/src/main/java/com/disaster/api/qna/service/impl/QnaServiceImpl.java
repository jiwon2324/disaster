package com.disaster.api.qna.service.impl;

import com.disaster.api.member.entity.Member;
import com.disaster.api.member.repository.QMemberRepository;
import com.disaster.api.qna.dto.QnaRequest;
import com.disaster.api.qna.dto.QnaResponse;
import com.disaster.api.qna.entity.Qna;
import com.disaster.api.qna.repository.QnaRepository;
import com.disaster.api.qna.service.QnaService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class QnaServiceImpl implements QnaService {

    private static final int ADMIN_GRADE_NO = 9;
    private static final String DEFAULT_CATEGORY = "기타";

    private final QnaRepository qnaRepository;
    private final QMemberRepository memberRepository;

    @Override
    public Page<QnaResponse> getQuestionList(
            String keyword,
            String category,
            Pageable pageable
    ) {
        Specification<Qna> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 목록에는 답변글이 아닌 질문글만 표시한다.
            predicates.add(criteriaBuilder.isNull(root.get("parentNo")));

            if (keyword != null && !keyword.isBlank()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";

                Predicate titleLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        likeKeyword
                );
                Predicate contentLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("content")),
                        likeKeyword
                );
                Predicate idLike = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("member").get("id")),
                        likeKeyword
                );

                predicates.add(criteriaBuilder.or(titleLike, contentLike, idLike));
            }

            if (category != null
                    && !category.isBlank()
                    && !"전체".equals(category)) {
                predicates.add(
                        criteriaBuilder.equal(root.get("category"), category.trim())
                );
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return qnaRepository.findAll(specification, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public List<QnaResponse> getThread(Long no) {
        Qna selected = getQna(no);
        Long refNo = selected.getRefNo() == null ? selected.getNo() : selected.getRefNo();

        Qna question = qnaRepository.findById(refNo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "원본 질문을 찾을 수 없습니다."
                ));

        question.setHit((question.getHit() == null ? 0L : question.getHit()) + 1L);

        List<Qna> thread = qnaRepository.findAllByRefNoOrderByOrdNoAsc(refNo);
        if (thread.isEmpty()) {
            thread = List.of(question);
        }

        return thread.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public QnaResponse createQuestion(QnaRequest request, String loginId) {
        validateRequest(request);
        Member member = getMember(loginId);

        Qna question = Qna.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .member(member)
                .hit(0L)
                .ordNo(0L)
                .levNo(0L)
                .parentNo(null)
                .category(normalizeCategory(request.getCategory()))
                .build();

        Qna saved = qnaRepository.save(question);
        saved.setRefNo(saved.getNo());

        log.info("QnA 질문 등록 완료. no={}, writer={}", saved.getNo(), loginId);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public QnaResponse updateQna(Long no, QnaRequest request, String loginId) {
        validateRequest(request);
        Qna qna = getQna(no);
        validateOwner(qna, loginId);

        if (qna.getParentNo() == null && qnaRepository.existsByParentNo(qna.getNo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "답변이 등록된 질문은 수정할 수 없습니다."
            );
        }

        qna.setTitle(request.getTitle().trim());
        qna.setContent(request.getContent().trim());

        if (qna.getParentNo() == null) {
            qna.setCategory(normalizeCategory(request.getCategory()));
        }

        return toResponse(qna);
    }

    @Override
    @Transactional
    public void deleteQna(Long no, String loginId) {
        Qna qna = getQna(no);
        validateOwner(qna, loginId);

        if (qna.getParentNo() == null) {
            List<Qna> answers = qnaRepository.findAllByParentNo(qna.getNo());
            if (!answers.isEmpty()) {
                qnaRepository.deleteAll(answers);
            }
        }

        qnaRepository.delete(qna);
        log.info("QnA 삭제 완료. no={}, requester={}", no, loginId);
    }

    @Override
    @Transactional
    public QnaResponse createAnswer(
            Long questionNo,
            QnaRequest request,
            String loginId
    ) {
        validateRequest(request);

        Member admin = getMember(loginId);
        if (admin.getGrade() == null
                || admin.getGrade().getGradeNo() == null
                || admin.getGrade().getGradeNo() != ADMIN_GRADE_NO) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "관리자만 답변을 등록할 수 있습니다."
            );
        }

        Qna question = getQna(questionNo);
        if (question.getParentNo() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "답변글에는 다시 답변할 수 없습니다."
            );
        }

        if (qnaRepository.existsByParentNo(question.getNo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 답변이 등록된 질문입니다."
            );
        }

        Long refNo = question.getRefNo() == null
                ? question.getNo()
                : question.getRefNo();

        Qna answer = Qna.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .member(admin)
                .hit(0L)
                .refNo(refNo)
                .ordNo((question.getOrdNo() == null ? 0L : question.getOrdNo()) + 1L)
                .levNo((question.getLevNo() == null ? 0L : question.getLevNo()) + 1L)
                .parentNo(question.getNo())
                .category(question.getCategory())
                .build();

        Qna saved = qnaRepository.save(answer);
        log.info("QnA 답변 등록 완료. questionNo={}, answerNo={}, admin={}",
                questionNo, saved.getNo(), loginId);

        return toResponse(saved);
    }

    private Qna getQna(Long no) {
        return qnaRepository.findById(no)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "QnA 글을 찾을 수 없습니다."
                ));
    }

    private Member getMember(String loginId) {
        if (loginId == null || loginId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인이 필요합니다."
            );
        }

        return memberRepository.findById(loginId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "로그인 회원 정보를 찾을 수 없습니다."
                ));
    }

    private void validateOwner(Qna qna, String loginId) {
        if (qna.getMember() == null
                || !qna.getMember().getId().equals(loginId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "본인이 작성한 글만 수정하거나 삭제할 수 있습니다."
            );
        }
    }

    private void validateRequest(QnaRequest request) {
        if (request == null
                || request.getTitle() == null
                || request.getTitle().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "제목은 필수입니다."
            );
        }

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "내용은 필수입니다."
            );
        }
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return DEFAULT_CATEGORY;
        }

        return category.trim();
    }

    private QnaResponse toResponse(Qna qna) {
        boolean answered = qna.getParentNo() != null
                || qnaRepository.existsByParentNo(qna.getNo());

        return QnaResponse.builder()
                .no(qna.getNo())
                .title(qna.getTitle())
                .content(qna.getContent())
                .writerId(qna.getMember() == null ? null : qna.getMember().getId())
                .writerName(qna.getMember() == null ? null : qna.getMember().getName())
                .writeDate(qna.getWriteDate())
                .hit(qna.getHit())
                .refNo(qna.getRefNo())
                .ordNo(qna.getOrdNo())
                .levNo(qna.getLevNo())
                .parentNo(qna.getParentNo())
                .category(qna.getCategory())
                .answerStatus(answered ? "답변완료" : "답변대기")
                .build();
    }
}
