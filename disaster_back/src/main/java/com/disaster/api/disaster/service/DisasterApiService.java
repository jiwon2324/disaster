package com.disaster.api.disaster.service;

import com.disaster.api.disaster.dto.DisasterApiResponseDTO;
import com.disaster.api.disaster.dto.DisasterApiResponseDTO.DisasterApiRow;
import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterCategoryRepository;
import com.disaster.api.disaster.repository.DisasterInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
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

    // 💡 서비스키
    private final String serviceKey = "H81M3194303G9W7H";

    @Transactional
    public int fetchAndSaveDisasterData() {
        String urlStr = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247"
                + "?serviceKey=" + serviceKey
                + "&pageNo=1&numOfRows=20&returnType=json";

        URI uri = URI.create(urlStr);
        log.info("API 호출 URI: {}", uri);

        try {
            // 1. Raw JSON 로그 확인
            String rawJson = restTemplate.getForObject(uri, String.class);
            log.info("API Raw Response: {}", rawJson);

            // 2. DTO 객체 매핑
            DisasterApiResponseDTO response = restTemplate.getForObject(uri, DisasterApiResponseDTO.class);

            if (response == null || response.getBody() == null) {
                log.warn("API 응답 body가 null입니다. (서비스키 또는 API 응답 형식 확인 필요)");
                return 0;
            }

            List<DisasterApiRow> rowList = response.getBody();
            int saveCount = 0;

            for (DisasterApiRow row : rowList) {
                // 중복 수집 체크 (SN)
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
                disasterInfo.setLocation(row.getRcptnRgnNm());
                disasterInfo.setDisasterDate(parseLocalDateTime(row.getCrtDt()));

                // DB 1~9번 카테고리와 키워드 분석 매핑
                DisasterCategory category = findOrCreateCategory(row.getDstSeNm(), rawMsg);
                disasterInfo.setCategory(category);

                disasterInfoRepository.save(disasterInfo);
                saveCount++;
            }

            log.info("신규 재난 정보 {}건 저장 성공!", saveCount);
            return saveCount;

        } catch (Exception e) {
            log.error("API 수집 및 저장 실패 상세 원인: ", e);
            throw new RuntimeException("API 수집 중 에러 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 재난 구분명(dstSeNm) 및 본문 내용(msgCn) 분석 후 기존 DB 1~9번 카테고리명과 매핑
     */
    private DisasterCategory findOrCreateCategory(String dstSeNm, String msgCn) {
        String catName = analyzeCategoryName(dstSeNm, msgCn);

        return disasterCategoryRepository.findByCatName(catName)
                .orElseGet(() -> {
                    log.info("신규 카테고리 저장: {}", catName);
                    DisasterCategory newCat = new DisasterCategory();
                    newCat.setCatName(catName);
                    return disasterCategoryRepository.save(newCat);
                });
    }

    /**
     * DB의 1~9번 카테고리명에 맞춘 키워드 분석 로직
     */
    private String analyzeCategoryName(String dstSeNm, String msgCn) {
        String combinedText = ((dstSeNm != null ? dstSeNm : "") + " " + (msgCn != null ? msgCn : "")).trim();

        if (combinedText.isEmpty()) {
            return "기타/미분류";
        }

        // 1번: 피해/폭발(산불 포함)
        if (combinedText.contains("화재") || combinedText.contains("산불") || combinedText.contains("폭발") || combinedText.contains("피해")) {
            return "피해/폭발(산불 포함)";
        }
        // 2번: 지진/해일
        if (combinedText.contains("지진") || combinedText.contains("해일")) {
            return "지진/해일";
        }
        // 3번: 태풍/호우(폭풍, 홍수 포함)
        if (combinedText.contains("태풍") || combinedText.contains("호우") || combinedText.contains("강풍") || combinedText.contains("풍랑") || combinedText.contains("침수") || combinedText.contains("대우") || combinedText.contains("홍수")) {
            return "태풍/호우(폭풍, 홍수 포함)";
        }
        // 4번: 폭염/한파(기온 관련)
        if (combinedText.contains("폭염") || combinedText.contains("한파") || combinedText.contains("대설") || combinedText.contains("빙판") || combinedText.contains("자외선")) {
            return "폭염/한파(기온 관련)";
        }
        // 5번: 산사태/붕괴
        if (combinedText.contains("산사태") || combinedText.contains("붕괴") || combinedText.contains("낙석")) {
            return "산사태/붕괴";
        }
        // 6번: 교통/산업사고
        if (combinedText.contains("교통") || combinedText.contains("통제") || combinedText.contains("사고") || combinedText.contains("우회") || combinedText.contains("추돌")) {
            return "교통/산업사고";
        }
        // 7번: 감염병/미세먼지
        if (combinedText.contains("감염병") || combinedText.contains("전염병") || combinedText.contains("방역") || combinedText.contains("미세먼지") || combinedText.contains("황사")) {
            return "감염병/미세먼지";
        }
        // 8번: 응급처치/대피소
        if (combinedText.contains("응급") || combinedText.contains("대피") || combinedText.contains("구호") || combinedText.contains("쉼터")) {
            return "응급처치/대피소";
        }

        // 9번: 기본값 (기타/미분류)
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
            log.warn("날짜 파싱 실패 (현재 시간 적용): {}", dateStr);
        }
        return LocalDateTime.now();
    }
}