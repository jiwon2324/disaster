package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterInfoService;
import com.disaster.api.disaster.vo.DisasterInfoRequestVO;
import com.disaster.api.disaster.vo.DisasterInfoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "DisasterInfo", description = "재난 정보 API")
@RestController
@RequestMapping("/disasterInfo")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterInfoController {

    private final DisasterInfoService disasterInfoService;

    // 1. 카테고리별 전체 재난 목록 조회
    // 예시 요청: GET /disasterInfo/category/1
    @Operation(summary = "카테고리별 재난 전체 목록 조회", description = "특정 카테고리에 속한 모든 재난 정보를 조회합니다.")
    @GetMapping("/category/{catid}")
    public ResponseEntity<List<DisasterInfoVO>> list(@PathVariable("catid") Long catid) {
        List<DisasterInfoVO> list = disasterInfoService.getDisasterListByCategory(catid);
        return ResponseEntity.ok(list);
    }

    // 2. 카테고리별 재난 목록 페이징 조회
    // 예시 요청: GET /disasterInfo/category/1/paged?page=0&size=10
    @Operation(summary = "카테고리별 재난 목록 페이징 조회", description = "특정 카테고리의 재난 목록을 페이징(Page, Size) 처리하여 반환합니다.")
    @GetMapping("/category/{catid}/paged")
    public ResponseEntity<Page<DisasterInfoVO>> listPaged(
            @PathVariable("catid") Long catid,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<DisasterInfoVO> pagedList = disasterInfoService.getDisasterListByCategoryPaged(catid, page, size);
        return ResponseEntity.ok(pagedList);
    }

    // 3. 재난 정보 상세 조희
    @Operation(summary = "재난 정보 상세 조회", description = "PK(id) 값을 통해 특정 재난 정보의 상세 내용을 조회합니다.")
    @GetMapping("/detail/{id}")
    public ResponseEntity<DisasterInfoVO> detail(@PathVariable("id") Long id) {
        DisasterInfoVO detail = disasterInfoService.getDisasterDetail(id);
        return ResponseEntity.ok(detail);
    }

    // 4. [관리자] 재난 정보 등록
    @Operation(summary = "재난 정보 등록 (관리자)", description = "관리자가 직접 재난 정보를 입력하여 등록합니다.")
    // @PreAuthorize("hasRole('ADMIN')") // 관리자 권한 체크 필요 시 주석 해제
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody DisasterInfoRequestVO requestVO) {
        Long savedId = disasterInfoService.createDisaster(requestVO);
        return ResponseEntity.ok(savedId);
    }

    // 5. [관리자] 재난 정보 수정
    @Operation(summary = "재난 정보 수정 (관리자)", description = "관리자가 기존 재난 정보를 수정합니다.")
    // @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable("id") Long id,
            @RequestBody DisasterInfoRequestVO requestVO) {
        disasterInfoService.updateDisaster(id, requestVO);
        return ResponseEntity.ok().build();
    }

    // 6. [관리자] 재난 정보 삭제
    @Operation(summary = "재난 정보 삭제 (관리자)", description = "관리자가 특정 재난 정보를 삭제합니다.")
    // @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        disasterInfoService.deleteDisaster(id);
        return ResponseEntity.ok().build();
    }
}