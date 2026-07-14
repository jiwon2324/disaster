package com.disaster.api.guide.controller;

import com.disaster.api.guide.service.EduGuideService;
import com.disaster.api.guide.vo.EduGuideMetaVO;
import com.disaster.api.guide.vo.EduGuideVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/edu")
@RequiredArgsConstructor
public class EduGuideRestController {

    private final EduGuideService eduGuideService;

    /**
     * 목록 조회
     *
     * GET /api/edu
     * GET /api/edu?word=지진
     * GET /api/edu?category=화재
     * GET /api/edu?page=1&size=10
     */
    @GetMapping
    public ResponseEntity<Page<EduGuideVO>> list(
            @RequestParam(required = false) String word,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EduGuideVO> result = eduGuideService.list(
                word,
                category,
                page,
                size
        );

        return ResponseEntity.ok(result);
    }

    /**
     * 상세 조회
     *
     * GET /api/edu/1
     */
    @GetMapping("/{no}")
    public ResponseEntity<EduGuideVO> view(
            @PathVariable Long no
    ) {
        return ResponseEntity.ok(
                eduGuideService.view(no)
        );
    }

    /**
     * 등록
     *
     * POST /api/edu
     */
    @PostMapping
    public ResponseEntity<EduGuideVO> write(
            @RequestBody EduGuideVO vo
    ) {
        EduGuideVO savedGuide =
                eduGuideService.write(vo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedGuide);
    }

    /**
     * 수정
     *
     * PUT /api/edu/1
     */
    @PutMapping("/{no}")
    public ResponseEntity<EduGuideVO> update(
            @PathVariable Long no,
            @RequestBody EduGuideVO vo
    ) {
        return ResponseEntity.ok(
                eduGuideService.update(no, vo)
        );
    }

    /**
     * 삭제
     *
     * DELETE /api/edu/1
     */
    @DeleteMapping("/{no}")
    public ResponseEntity<Void> delete(
            @PathVariable Long no
    ) {
        eduGuideService.delete(no);

        return ResponseEntity.noContent().build();
    }

    /**
     * 관리자 대시보드 통계
     *
     * GET /api/edu/meta
     */
    @GetMapping("/meta")
    public ResponseEntity<EduGuideMetaVO> getMetaData() {
        return ResponseEntity.ok(
                eduGuideService.getMetaData()
        );
    }
}