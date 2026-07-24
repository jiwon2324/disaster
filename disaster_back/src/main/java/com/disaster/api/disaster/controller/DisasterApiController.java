package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "DisasterApiCollector", description = "4대 개별 재난 API 수집기")
@RestController
@RequestMapping("/api/disaster")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterApiController {

    private final DisasterApiService disasterApiService;

    // 1. 행안부 재난문자 수집
    @Operation(summary = "재난문자 데이터 수집")
    @GetMapping("/collect")
    public ResponseEntity<Map<String, Object>> disasterMsg(
            @RequestParam(name = "pages", defaultValue = "3") int pages) {

        Map<String, Object> response = new HashMap<>();
        int savedCount = disasterApiService.serviceSavedMsg(pages);
        response.put("success", true);
        response.put("savedCount", savedCount);
        return ResponseEntity.ok(response);
    }

    // 2. 기상청 단기예보 수집
    @Operation(summary = "기상청 단기예보 데이터 수집")
    @GetMapping("/collect/weather")
    public ResponseEntity<Map<String, Object>> weather() {
        Map<String, Object> response = new HashMap<>();
        int savedCount = disasterApiService.serviceWeather();
        response.put("success", true);
        response.put("savedCount", savedCount);
        return ResponseEntity.ok(response);
    }

    // 3. 산림청 산불통계 수집
    @Operation(summary = "산림청 산불발생통계 데이터 수집")
    @GetMapping("/collect/forest-fire")
    public ResponseEntity<Map<String, Object>> forestFire() {
        Map<String, Object> response = new HashMap<>();
        int savedCount = disasterApiService.serviceFire();
        response.put("success", true);
        response.put("savedCount", savedCount);
        return ResponseEntity.ok(response);
    }

    // 4. 기상청 지진정보 수집
    @Operation(summary = "기상청 지진정보 데이터 수집")
    @GetMapping("/collect/earthquake")
    public ResponseEntity<Map<String, Object>> earthquake() {
        Map<String, Object> response = new HashMap<>();
        int savedCount = disasterApiService.serviceEarthquake();
        response.put("success", true);
        response.put("savedCount", savedCount);
        return ResponseEntity.ok(response);
    }

    // 5. 전체 데이터 통합 수집
    @Operation(summary = "전체 기관(행안부, 기상청, 산림청) 데이터 통합 수집")
    @GetMapping("/collect/all")
    public ResponseEntity<Map<String, Object>> all() {
        Map<String, Object> response = new HashMap<>();
        int msgCount = disasterApiService.serviceSavedMsg(3);
        int weatherCount = disasterApiService.serviceWeather();
        int fireCount = disasterApiService.serviceFire();
        int eqkCount = disasterApiService.serviceEarthquake();

        response.put("success", true);
        response.put("totalSaved", msgCount + weatherCount + fireCount + eqkCount);
        response.put("disasterMsgSaved", msgCount);
        response.put("weatherSaved", weatherCount);
        response.put("forestFireSaved", fireCount);
        response.put("earthquakeSaved", eqkCount);

        return ResponseEntity.ok(response);
    }
}