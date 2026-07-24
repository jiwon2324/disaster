package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterCategoryService;
import com.disaster.api.disaster.vo.DisasterCategoryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "DisasterCategory", description = "재난 카테고리 API")
@RestController
@RequestMapping("/disasterCategory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterCategoryController {

    private final DisasterCategoryService disasterCategoryService;

    @Operation(summary = "카테고리 목록 조회", description = "React 카드로 표시할 카테고리 목록을 반환합니다.")
    @GetMapping("/list.do")
    public ResponseEntity<List<DisasterCategoryVO>> list() {
        List<DisasterCategoryVO> categoryList = disasterCategoryService.allCategory();
        return ResponseEntity.ok(categoryList);
    }

    // 관리자 전용 추가, 수정, 삭제
    @Operation(summary = "카테고리 상세 조회 (수정 폼용)", description = "수정 모달/폼에 기존 카테고리 정보를 채우기 위해 단건 조회합니다.")
    @GetMapping("/get.do")
    public ResponseEntity<DisasterCategoryVO> get(@RequestParam("catid") Long catid) {
        DisasterCategoryVO category = disasterCategoryService.getCategory(catid);
        return ResponseEntity.ok(category);
    }

    @Operation(summary = "카테고리 추가", description = "새로운 재난 카테고리를 등록합니다.")
    @PostMapping("/add.do")
    public ResponseEntity<String> add(@RequestBody DisasterCategoryVO vo) {
        disasterCategoryService.addCategory(vo);
        return ResponseEntity.ok("카테고리가 정상적으로 추가되었습니다.");
    }

    @Operation(summary = "카테고리 수정", description = "기존 카테고리명(catName)을 수정합니다.")
    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody DisasterCategoryVO vo) {
        disasterCategoryService.updateCategory(vo);
        return ResponseEntity.ok("카테고리가 정상적으로 수정되었습니다.");
    }

    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다.")
    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestParam("catid") Long catid) {
        disasterCategoryService.deleteCategory(catid);
        return ResponseEntity.ok("카테고리가 정상적으로 삭제되었습니다.");
    }
}