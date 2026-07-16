package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterCatAssign;
import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterCategoryMasterRepository;
import com.disaster.api.disaster.repository.DisasterCategoryRepository;
import com.disaster.api.disaster.repository.DisasterCatAssignRepository;
import com.disaster.api.disaster.repository.DisasterInfoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisasterCategoryService {

    private final DisasterCategoryRepository disasterCategoryRepository;
    private final DisasterCatAssignRepository disasterCatAssignRepository;
    private final DisasterInfoRepository disasterInfoRepository;
    private final DisasterCategoryMasterRepository disasterCategoryMasterRepository;


    // API 연동 및 엔티티 저장 로직
    @Transactional
    public void updateDisasterData(int dummyCatID) throws Exception {
        String serviceKey = "fa67fab4500ff954472e8a22de42afe98bf413eba38a0fdc515c299cd184a2d8";

        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1741000/DisasterMsg3/getDisasterMsg1List");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + serviceKey);
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode("10", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("type", "UTF-8") + "=" + URLEncoder.encode("xml", "UTF-8"));

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/xml");

        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            try (InputStream is = conn.getInputStream()) {
                XmlMapper xmlMapper = new XmlMapper();
                JsonNode root = xmlMapper.readTree(is);
                JsonNode rows = root.path("row");

                if (rows.isArray()) {
                    for (JsonNode row : rows) {
                        String apiId = row.path("md101_sn").asText();

                        // JPA를 통한 중복 체크
                        if (disasterCategoryRepository.existsByApiId(apiId)) {
                            continue;
                        }

                        String createDateRaw = row.path("create_date").asText();
                        String locationName = row.path("rcv_area_nm").asText();
                        String content = row.path("msg").asText();

                        String formattedDate = "";
                        if (createDateRaw != null && createDateRaw.length() >= 14) {
                            String yyyy = createDateRaw.substring(0, 4);
                            String mm = createDateRaw.substring(4, 6);
                            String dd = createDateRaw.substring(6, 8);
                            String hh = createDateRaw.substring(8, 10);
                            String mi = createDateRaw.substring(10, 12);
                            String ss = createDateRaw.substring(12, 14);
                            formattedDate = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;
                        } else {
                            formattedDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
                        }

                        List<Integer> catIDs = getCategoryList(locationName, content);
                        int representativeCatID = catIDs.isEmpty() ? 9 : catIDs.get(0);

                        // 1. 대표 DisasterInfo 영속화 및 저장
                        DisasterInfo info = new DisasterInfo();
                        info.setApiId(apiId);
                        info.setLocationName(locationName);
                        info.setContent(content);
                        info.setCreateDate(formattedDate);
                        info.setDangerLevel(1);

                        // save() 호출 시 영속 컨텍스트를 거쳐 DB에 저장되고 Sequence에 의한 ID(no)가 바인딩됩니다.
                        DisasterInfo savedInfo = disasterInfoRepository.save(info);

                        // 2. 다중 카테고리 매핑 관계가 감지되었을 경우 DisasterCatAssign 엔티티를 생성하여 저장
                        for (Integer catId : catIDs) {
                            DisasterCatAssign assign = new DisasterCatAssign();
                            assign.setNo(savedInfo.getNo()); // 방금 저장하며 발급받은 PK 설정
                            assign.setCatId(Long.valueOf(catId));
                            disasterCatAssignRepository.save(assign);
                        }
                    }
                }
            }
        }
        conn.disconnect();
    }

    private List<Integer> getCategoryList(String location, String content) {
        List<Integer> catIDs = new ArrayList<>();
        String text = (location == null ? "" : location) + " " + (content == null ? "" : content);

        if (text.contains("화재") || text.contains("산불") || text.contains("폭발") || text.contains("발화") || text.contains("연기")) catIDs.add(1);
        if (text.contains("지진") || text.contains("해일") || text.contains("규모") || text.contains("진도")) catIDs.add(2);
        if (text.contains("태풍") || text.contains("호우") || text.contains("강풍") || text.contains("침수") || text.contains("범람")) catIDs.add(3);
        if (text.contains("폭염") || text.contains("한파") || text.contains("대설") || text.contains("적설") || text.contains("추위") || text.contains("더위") || text.contains("폭설")) catIDs.add(4);
        if (text.contains("산사태") || text.contains("붕괴") || text.contains("낙석")) catIDs.add(5);
        if (text.contains("교통") || text.contains("사고") || text.contains("통제") || text.contains("우회") || text.contains("정체")) catIDs.add(6);
        if (text.contains("단수") || text.contains("정전") || text.contains("가스") || text.contains("통신")) catIDs.add(7);
        if (text.contains("실종") || text.contains("수색") || text.contains("배회") || text.contains("찾습니다")) catIDs.add(8);

        return catIDs;
    }

    @Transactional(readOnly = true)
    public List<DisasterCategory> getAllCategories() {
        return disasterCategoryMasterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DisasterCategory getCategory(Long catId) {
        return disasterCategoryMasterRepository.findById(catId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다. ID=" + catId));
    }

    @Transactional
    public void saveCategory(DisasterCategory category) {
        disasterCategoryMasterRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long catId) {
        disasterCategoryMasterRepository.deleteById(catId);
    }
}