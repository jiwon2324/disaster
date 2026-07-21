package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "DisasterApiCollector", description = "공공데이터 재난 API 수집기")
@RestController
@RequestMapping("/api/disaster")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterApiController {

    private final DisasterApiService disasterApiService;

    @Operation(summary = "외부 API 재난 데이터 수집 및 DB 자동 카테고리화 수집")
    @GetMapping("/collect")
    public ResponseEntity<Map<String, Object>> collectApiData() {
        Map<String, Object> response = new HashMap<>();
        try {
            int savedCount = disasterApiService.fetchAndSaveDisasterData();
            response.put("success", true);
            response.put("message", "성공적으로 수집되었습니다.");
            response.put("savedCount", savedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}