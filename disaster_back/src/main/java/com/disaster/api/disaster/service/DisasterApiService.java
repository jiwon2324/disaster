package com.disaster.api.disaster.service;

import com.disaster.api.disaster.dto.DisasterApiResponseDTO;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.DisasterApiRow;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.EarthquakeResponseDTO;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.EarthquakeResponseDTO.EarthquakeItem;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.ForestFireResponseDTO;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.ForestFireResponseDTO.ForestFireItem;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.VilageFcstResponseDTO;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.VilageFcstResponseDTO.VilageFcstItem;
import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterCategoryRepository;
import com.disaster.api.disaster.repository.DisasterInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisasterApiService {

    private final DisasterInfoRepository disasterInfoRepository;
    private final DisasterCategoryRepository disasterCategoryRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private final String serviceKey = "H81M3194303G9W7H";

    // =========================================================================
    // 1. 행안부 재난문자 수집 (300개 수동 & 30분 주기 자동)
    // =========================================================================
    @Transactional
    public int fetchAndSaveDisasterData(int totalPages) {
        int totalSavedCount = 0;
        for (int page = 1; page <= totalPages; page++) {
            String urlStr = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247"
                    + "?serviceKey=" + serviceKey
                    + "&pageNo=" + page
                    + "&numOfRows=100&returnType=json";

            try {
                DisasterApiResponseDTO response = restTemplate.getForObject(URI.create(urlStr), DisasterApiResponseDTO.class);
                if (response != null && response.getBody() != null) {
                    totalSavedCount += processAndSaveRows(response.getBody());
                }
            } catch (Exception e) {
                log.error("[재난문자] {}페이지 수집 에러: {}", page, e.getMessage());
            }
        }
        return totalSavedCount;
    }

    @Transactional
    public int fetchAndSaveDisasterData() {
        return fetchAndSaveDisasterData(3);
    }

    @Scheduled(cron = "0 0/30 * * * *")
    @Transactional
    public void safeAutoFetchSchedule() {
        log.info("[정기 수집] 최신 재난 정보 자동 확인 중...");
        String urlStr = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247"
                + "?serviceKey=" + serviceKey
                + "&pageNo=1&numOfRows=15&returnType=json";

        try {
            DisasterApiResponseDTO response = restTemplate.getForObject(URI.create(urlStr), DisasterApiResponseDTO.class);
            if (response != null && response.getBody() != null) {
                int count = processAndSaveRows(response.getBody());
                log.info("[정기 수집] 신규 데이터 {}건 추가됨", count);
            }
        } catch (Exception e) {
            log.error("[정기 수집 실패]: {}", e.getMessage());
        }
    }

    // =========================================================================
    // 2. 기상청 단기예보 API 연동
    // =========================================================================
    @Transactional
    public int fetchVilageFcst() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String urlStr = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
                + "?serviceKey=" + serviceKey
                + "&pageNo=1&numOfRows=60&dataType=JSON&base_date=" + today + "&base_time=0500&nx=55&ny=127";

        int savedCount = 0;
        try {
            VilageFcstResponseDTO response = restTemplate.getForObject(URI.create(urlStr), VilageFcstResponseDTO.class);
            if (response != null && response.getResponse() != null && response.getResponse().getBody() != null) {
                List<VilageFcstItem> items = response.getResponse().getBody().getItems().getItem();
                for (VilageFcstItem item : items) {
                    String apiId = "FCST_" + item.getBaseDate() + "_" + item.getCategory();
                    if (disasterInfoRepository.existsByApiId(apiId)) continue;

                    DisasterInfo disasterInfo = new DisasterInfo();
                    disasterInfo.setApiId(apiId);
                    disasterInfo.setTitle("[기상예보] " + item.getCategory() + " 예보값: " + item.getFcstValue());
                    disasterInfo.setContent("기상청 단기예보 정보입니다. 카테고리: " + item.getCategory() + ", 값: " + item.getFcstValue());
                    disasterInfo.setLocation("X:" + item.getNx() + " Y:" + item.getNy());
                    disasterInfo.setDisasterDate(LocalDateTime.now());

                    DisasterCategory category = findOrCreateCategory("기상예보", item.getCategory());
                    disasterInfo.setCategory(category);

                    disasterInfoRepository.save(disasterInfo);
                    savedCount++;
                }
            }
        } catch (Exception e) {
            log.error("[기상청 단기예보] 수집 에러: {}", e.getMessage());
        }
        return savedCount;
    }

    // =========================================================================
    // 3. 산림청 산불발생통계 API 연동
    // =========================================================================
    @Transactional
    public int fetchForestFire() {
        // 20200101부터 현재까지의 산불 통계를 100건 수집하도록 기간 지정
        String urlStr = "http://apis.data.go.kr/1400000/forestFireStatService/getforestFireStatList"
                + "?serviceKey=" + serviceKey
                + "&pageNo=1&numOfRows=100"
                + "&searchStDt=20200101&searchEdDt=20260721" // 검색 기간 추가
                + "&_type=json";

        URI uri = URI.create(urlStr);
        int savedCount = 0;

        try {
            log.info("[산림청 산불] API 호출: {}", uri);

            // Raw String으로 일단 받아서 로그 확인 (XML인지 JSON인지 판별)
            String rawResponse = restTemplate.getForObject(uri, String.class);
            log.info("[산림청 산불] Raw Response: {}", rawResponse);

            ForestFireResponseDTO response = restTemplate.getForObject(uri, ForestFireResponseDTO.class);

            if (response != null && response.getResponse() != null
                    && response.getResponse().getBody() != null
                    && response.getResponse().getBody().getItems() != null) {

                List<ForestFireItem> items = response.getResponse().getBody().getItems().getItem();

                for (ForestFireItem item : items) {
                    // 식별용 unique apiId 생성
                    String apiId = "FIRE_" + item.getStartyear() + item.getStartmonth() + item.getStartday()
                            + "_" + (item.getLocgungu() != null ? item.getLocgungu() : "0");

                    if (disasterInfoRepository.existsByApiId(apiId)) {
                        continue;
                    }

                    String locName = (item.getLocsi() != null ? item.getLocsi() : "") + " "
                            + (item.getLocgungu() != null ? item.getLocgungu() : "") + " "
                            + (item.getLocdong() != null ? item.getLocdong() : "");

                    DisasterInfo disasterInfo = new DisasterInfo();
                    disasterInfo.setApiId(apiId);
                    disasterInfo.setTitle("[산불] " + locName.trim() + " 산불 (원인: " + item.getFirecause() + ")");
                    disasterInfo.setContent("산불 발생원인: " + item.getFirecause() + ", 피해면적: " + item.getDamagearea() + "ha");
                    disasterInfo.setLocation(safeSubstring(locName, 1000));
                    disasterInfo.setDisasterDate(parseFireDate(item));

                    // 1번 카테고리 "화재/폭발"로 저장
                    DisasterCategory category = findOrCreateCategory("산불", "화재 산불 " + item.getFirecause());
                    disasterInfo.setCategory(category);

                    disasterInfoRepository.save(disasterInfo);
                    savedCount++;
                }
            } else {
                log.warn("[산림청 산불] 응답 데이터가 null이거나 파싱 실패했습니다.");
            }
        } catch (Exception e) {
            log.error("[산림청 산불통계] 수집 에러: ", e);
        }

        log.info("[산림청 산불통계] 신규 저장 건수: {}건", savedCount);
        return savedCount;
    }
    // =========================================================================
    // 4. 기상청 지진정보 조회 API 연동
    // =========================================================================
    @Transactional
    public int fetchEarthquake() {
        String urlStr = "http://apis.data.go.kr/1360000/EqkInfoService_2/getEqkMsg"
                + "?serviceKey=" + serviceKey
                + "&pageNo=1&numOfRows=50&dataType=JSON";

        int savedCount = 0;
        try {
            EarthquakeResponseDTO response = restTemplate.getForObject(URI.create(urlStr), EarthquakeResponseDTO.class);
            if (response != null && response.getResponse() != null && response.getResponse().getBody() != null) {
                List<EarthquakeItem> items = response.getResponse().getBody().getItems().getItem();
                for (EarthquakeItem item : items) {
                    String apiId = "EQK_" + item.getTmSeq();
                    if (disasterInfoRepository.existsByApiId(apiId)) continue;

                    DisasterInfo disasterInfo = new DisasterInfo();
                    disasterInfo.setApiId(apiId);
                    disasterInfo.setTitle("[지진] 규모 " + item.getMt() + " 지진 발생 - " + item.getLoc());
                    disasterInfo.setContent(item.getRem() != null ? item.getRem() : "진앙위치: " + item.getLoc() + ", 최대진도: " + item.getInT());
                    disasterInfo.setLocation(safeSubstring(item.getLoc(), 1000));
                    disasterInfo.setDisasterDate(parseLocalDateTime(item.getTmEqk()));

                    // 2번 카테고리인 '지진/해일'로 매핑
                    DisasterCategory category = findOrCreateCategory("지진", item.getRem());
                    disasterInfo.setCategory(category);

                    disasterInfoRepository.save(disasterInfo);
                    savedCount++;
                }
            }
        } catch (Exception e) {
            log.error("[기상청 지진정보] 수집 에러: {}", e.getMessage());
        }
        return savedCount;
    }

    // =========================================================================
    // 5. 공통 처리 메서드 및 카테고리 분석
    // =========================================================================
    private int processAndSaveRows(List<DisasterApiRow> rowList) {
        int count = 0;
        for (DisasterApiRow row : rowList) {
            if (row.getSn() != null && disasterInfoRepository.existsByApiId(row.getSn())) {
                continue;
            }

            DisasterInfo disasterInfo = new DisasterInfo();
            disasterInfo.setApiId(row.getSn());

            String rawMsg = row.getMsgCn();
            String summaryTitle = (rawMsg != null && rawMsg.length() > 30)
                    ? rawMsg.substring(0, 30) + "..."
                    : rawMsg;

            disasterInfo.setTitle("[" + (row.getDstSeNm() != null ? row.getDstSeNm() : "재난") + "] " + summaryTitle);
            disasterInfo.setContent(rawMsg);
            disasterInfo.setLocation(safeSubstring(row.getRcptnRgnNm(), 1000));
            disasterInfo.setDisasterDate(parseLocalDateTime(row.getCrtDt()));

            DisasterCategory category = findOrCreateCategory(row.getDstSeNm(), rawMsg);
            disasterInfo.setCategory(category);

            disasterInfoRepository.save(disasterInfo);
            count++;
        }
        return count;
    }

    private String safeSubstring(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private DisasterCategory findOrCreateCategory(String dstSeNm, String msgCn) {
        String catName = analyzeCategoryName(dstSeNm, msgCn);

        return disasterCategoryRepository.findByCatName(catName)
                .orElseGet(() -> {
                    DisasterCategory newCat = new DisasterCategory();
                    newCat.setCatName(catName);
                    return disasterCategoryRepository.save(newCat);
                });
    }

    private String analyzeCategoryName(String dstSeNm, String msgCn) {
        String combinedText = ((dstSeNm != null ? dstSeNm : "") + " " + (msgCn != null ? msgCn : "")).trim();

        if (combinedText.isEmpty()) return "기타/미분류";

        // 1번: 피해/폭발(산불 포함)
        if (combinedText.contains("화재") || combinedText.contains("산불") || combinedText.contains("폭발")) {
            return "화재/폭발";
        }
        // 2번: 지진/해일
        if (combinedText.contains("지진") || combinedText.contains("해일")) {
            return "지진/해일";
        }
        // 3번: 태풍/호우(폭풍, 홍수 포함)
        if (combinedText.contains("태풍") || combinedText.contains("호우") || combinedText.contains("강풍") || combinedText.contains("풍랑") || combinedText.contains("침수") || combinedText.contains("홍수")) {
            return "태풍/호우(폭풍, 홍수 포함)";
        }
        // 4번: 폭염/한파(기온 관련)
        if (combinedText.contains("폭염") || combinedText.contains("한파") || combinedText.contains("대설") || combinedText.contains("빙판")) {
            return "폭염/한파(기온 관련)";
        }
        // 5번: 산사태/붕괴
        if (combinedText.contains("산사태") || combinedText.contains("붕괴") || combinedText.contains("낙석")) {
            return "산사태/붕괴";
        }
        // 6번: 교통/산업사고
        if (combinedText.contains("교통") || combinedText.contains("통제") || combinedText.contains("사고") || combinedText.contains("추돌")) {
            return "교통/산업사고";
        }
        // 7번: 감염병/미세먼지
        if (combinedText.contains("감염병") || combinedText.contains("전염병") || combinedText.contains("미세먼지") || combinedText.contains("황사")) {
            return "감염병/미세먼지";
        }
        // 8번: 응급처치/대피소
        if (combinedText.contains("응급") || combinedText.contains("대피") || combinedText.contains("구호") || combinedText.contains("쉼터")) {
            return "응급처치/대피소";
        }

        return "기타/미분류";
    }

    private LocalDateTime parseLocalDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return LocalDateTime.now();
        try {
            String cleaned = dateStr.replaceAll("[^0-9]", "");
            if (cleaned.length() >= 14) {
                return LocalDateTime.parse(cleaned.substring(0, 14), DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            } else if (cleaned.length() == 8) {
                return LocalDateTime.parse(cleaned + "000000", DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            }
        } catch (Exception e) {
            log.warn("날짜 파싱 실패: {}", dateStr);
        }
        return LocalDateTime.now();
    }

    private LocalDateTime parseFireDate(ForestFireItem item) {
        try {
            String year = String.format("%04d", Integer.parseInt(item.getStartyear()));
            String month = String.format("%02d", Integer.parseInt(item.getStartmonth()));
            String day = String.format("%02d", Integer.parseInt(item.getStartday()));
            return LocalDateTime.parse(year + month + day + "000000", DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}