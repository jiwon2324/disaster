package com.disaster.api.checklist.controller;

import com.disaster.api.checklist.service.ChecklistService;
import com.disaster.api.checklist.vo.ChecklistMetaVO;
import com.disaster.api.checklist.vo.ChecklistVO;
import com.disaster.api.checklist.vo.ReadyStatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
public class ChecklistRestController {

    private final ChecklistService checklistService;

    /**
     * 사용자 체크리스트 목록
     *
     * GET /api/checklists?id=user01
     */
    @GetMapping
    public ResponseEntity<Page<ChecklistVO>> list(
            @RequestParam String id,
            @RequestParam(required = false) String word,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ChecklistVO> result =
                checklistService.list(
                        id,
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
     * GET /api/checklists/1
     */
    @GetMapping("/{no}")
    public ResponseEntity<ChecklistVO> view(
            @PathVariable Long no
    ) {
        return ResponseEntity.ok(
                checklistService.view(no)
        );
    }

    /**
     * 등록
     *
     * POST /api/checklists
     */
    @PostMapping
    public ResponseEntity<ChecklistVO> write(
            @RequestBody ChecklistVO vo
    ) {
        ChecklistVO savedChecklist =
                checklistService.write(vo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedChecklist);
    }

    /**
     * 수정
     *
     * PUT /api/checklists/1
     */
    @PutMapping("/{no}")
    public ResponseEntity<ChecklistVO> update(
            @PathVariable Long no,
            @RequestBody ChecklistVO vo
    ) {
        return ResponseEntity.ok(
                checklistService.update(no, vo)
        );
    }

    /**
     * 준비 상태 변경
     *
     * PATCH /api/checklists/1/ready
     */
    @PatchMapping("/{no}/ready")
    public ResponseEntity<ChecklistVO> changeReady(
            @PathVariable Long no,
            @RequestBody ReadyStatusRequest request
    ) {
        return ResponseEntity.ok(
                checklistService.changeReady(
                        no,
                        request.getIsReady()
                )
        );
    }

    /**
     * 삭제
     *
     * DELETE /api/checklists/1
     */
    @DeleteMapping("/{no}")
    public ResponseEntity<Void> delete(
            @PathVariable Long no
    ) {
        checklistService.delete(no);

        return ResponseEntity.noContent().build();
    }

    /**
     * 사용자별 체크리스트 통계
     *
     * GET /api/checklists/meta?id=user01
     */
    @GetMapping("/meta")
    public ResponseEntity<ChecklistMetaVO> getMetaData(
            @RequestParam String id
    ) {
        return ResponseEntity.ok(
                checklistService.getMetaData(id)
        );
    }
}