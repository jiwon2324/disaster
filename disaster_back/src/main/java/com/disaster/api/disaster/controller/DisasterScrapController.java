package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterScrapService;
import com.disaster.api.disaster.vo.DisasterScrapVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "DisasterScrap", description = "재난 정보 스크랩 API")
@RestController
@RequestMapping("/disasterScrap")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterScrapController {

    private final DisasterScrapService disasterScrapService;

    // 1. 스크랩 추가
    @Operation(summary = "스크랩 추가")
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addScrap(@RequestParam("id") String memberId,
                                                        @RequestParam("no") Long disasterNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long scrapNo = disasterScrapService.addScrap(memberId, disasterNo);
            response.put("success", true);
            response.put("message", "스크랩에 추가되었습니다.");
            response.put("scrapNo", scrapNo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 2. 스크랩 취소
    @Operation(summary = "스크랩 취소")
    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeScrap(@RequestParam("id") String memberId,
                                                           @RequestParam("no") Long disasterNo) {
        Map<String, Object> response = new HashMap<>();
        try {
            disasterScrapService.removeScrap(memberId, disasterNo);
            response.put("success", true);
            response.put("message", "스크랩이 취소되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 3. 내 스크랩 목록 조회
    @Operation(summary = "내 스크랩 목록 조회")
    @GetMapping("/list/{id}")
    public ResponseEntity<List<DisasterScrapVO>> getMyScrapList(@PathVariable("id") String memberId) {
        List<DisasterScrapVO> list = disasterScrapService.getMyScrapList(memberId);
        return ResponseEntity.ok(list);
    }

    // 4. 스크랩 여부 확인
    @Operation(summary = "스크랩 여부 확인")
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkScraped(@RequestParam("id") String memberId,
                                                @RequestParam("no") Long disasterNo) {
        boolean isScraped = disasterScrapService.isScraped(memberId, disasterNo);
        return ResponseEntity.ok(isScraped);
    }
}