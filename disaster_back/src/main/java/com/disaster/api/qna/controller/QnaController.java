package com.disaster.api.qna.controller;

import com.disaster.api.qna.dto.QnaRequest;
import com.disaster.api.qna.dto.QnaResponse;
import com.disaster.api.qna.service.QnaService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

@RestController
@RequestMapping("/qna")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class QnaController {

    private final QnaService qnaService;

    @GetMapping("/list.do")
    @Operation(summary = "문의 목록 및 검색")
    public Page<QnaResponse> list(
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "no"
                )
        );

        return qnaService.getQuestionList(
                searchType,
                keyword,
                category,
                pageable
        );
    }

    @GetMapping("/view.do")
    @Operation(summary = "문의 질문과 답변 상세조회")
    public List<QnaResponse> view(
            @RequestParam Long no
    ) {
        return qnaService.getThread(no);
    }

    @PostMapping("/write.do")
    @Operation(summary = "문의 등록")
    public QnaResponse write(
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.createQuestion(
                request,
                authentication.getName()
        );
    }

    @PutMapping("/update.do")
    @Operation(summary = "문의 또는 답변 수정")
    public QnaResponse update(
            @RequestParam Long no,
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.updateQna(
                no,
                request,
                authentication.getName()
        );
    }

    @DeleteMapping("/delete.do")
    @Operation(summary = "문의 또는 답변 삭제")
    public void delete(
            @RequestParam Long no,
            Authentication authentication
    ) {
        qnaService.deleteQna(
                no,
                authentication.getName()
        );
    }

    @PostMapping("/answer.do")
    @Operation(summary = "관리자 문의 답변 등록")
    public QnaResponse answer(
            @RequestParam Long no,
            @RequestBody QnaRequest request,
            Authentication authentication
    ) {
        return qnaService.createAnswer(
                no,
                request,
                authentication.getName()
        );
    }
}