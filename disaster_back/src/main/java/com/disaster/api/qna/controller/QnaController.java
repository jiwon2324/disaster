package com.disaster.api.qna.controller;

import com.disaster.api.qna.dto.QnaRequest;
import com.disaster.api.qna.dto.QnaResponse;
import com.disaster.api.qna.service.QnaService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.data.domain.Sort.Direction.DESC;

@RestController
@RequestMapping("/qna")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class QnaController {

    private final QnaService qnaService;

    @GetMapping("/list.do")
    @Operation(summary = "QnA 질문 목록")
    public Page<QnaResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "no", direction = DESC)
            Pageable pageable
    ) {
        return qnaService.getQuestionList(keyword, category, pageable);
    }

    @GetMapping("/view.do")
    @Operation(summary = "QnA 질문과 답변 상세보기")
    public List<QnaResponse> view(@RequestParam Long no) {
        return qnaService.getThread(no);
    }

    @PostMapping("/write.do")
    @Operation(summary = "QnA 질문 등록")
    public QnaResponse write(
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.createQuestion(request, authentication.getName());
    }

    @PutMapping("/update.do")
    @Operation(summary = "QnA 수정")
    public QnaResponse update(
            @RequestParam Long no,
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.updateQna(no, request, authentication.getName());
    }

    @DeleteMapping("/delete.do")
    @Operation(summary = "QnA 삭제")
    public void delete(
            @RequestParam Long no,
            Authentication authentication
    ) {
        qnaService.deleteQna(no, authentication.getName());
    }

    @PostMapping("/answer.do")
    @Operation(summary = "관리자 QnA 답변 등록")
    public QnaResponse answer(
            @RequestParam Long no,
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.createAnswer(no, request, authentication.getName());
    }
}
