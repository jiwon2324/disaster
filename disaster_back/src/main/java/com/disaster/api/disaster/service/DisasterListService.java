package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterCatAssign;
import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterCatAssignRepository;
import com.disaster.api.disaster.repository.DisasterCategoryMasterRepository;
import com.disaster.api.disaster.repository.DisasterListRepository;
import com.disaster.api.util.page.PageObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DisasterListService {

    private final DisasterListRepository disasterListRepository;
    private final DisasterCategoryMasterRepository disasterCategoryMasterRepository;
    private final DisasterCatAssignRepository disasterCatAssignRepository;

    public DisasterListService(DisasterListRepository disasterListRepository, DisasterCategoryMasterRepository disasterCategoryMasterRepository, DisasterCatAssignRepository disasterCatAssignRepository) {
        this.disasterListRepository = disasterListRepository;
        this.disasterCategoryMasterRepository = disasterCategoryMasterRepository;
        this.disasterCatAssignRepository = disasterCatAssignRepository;
    }

    @Transactional
    public List<DisasterInfo> getDisasterList(Long catId, PageObject pageObject) throws Exception {
        // 기존 PageObject의 시작 페이지는 1부터 시작하지만, Spring Data JPA의 PageRequest는 0-index 기반입니다.
        int jpaPage = (int) pageObject.getPage() - 1;
        if (jpaPage < 0) jpaPage = 0;

        int jpaSize = (int) pageObject.getPerPageNum();

        // 1. Spring Pageable 생성 (내림차순 정렬 포함)
        Pageable pageable = PageRequest.of(jpaPage, jpaSize, Sort.by(Sort.Direction.DESC, "no"));

        // 2. Repository 호출을 통한 페이징 및 검색 수행
        Page<DisasterInfo> resultPage = disasterListRepository.findDisasters(
                catId,
                pageObject.getKey(),
                pageObject.getWord(),
                pageable
        );

        // 3. 기존 UI의 PageObject 컴포넌트와 호환을 위해 총 로우 수 설정 반영
        pageObject.setTotalRow(resultPage.getTotalElements());

        return resultPage.getContent();
    }

    public DisasterInfo getDisasterDetail(long no, long inc) throws Exception {
        return disasterListRepository.findById(no)
                .orElseThrow(() -> new IllegalArgumentException("해당 재난 정보가 존재하지 않습니다. no=" + no));
    }

    @Transactional
    public void registerDisaster(DisasterInfo info, Long catId) throws Exception {
        if (info.getApiId() == null || info.getApiId().isEmpty()) {
            info.setApiId("MANUAL_" + System.currentTimeMillis());
        }
        if (info.getCreateDate() == null || info.getCreateDate().isEmpty()) {
            info.setCreateDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        }
        if (info.getSummary() == null || info.getSummary().isEmpty()) {
            info.setSummary("M");
        }

        DisasterInfo savedInfo = disasterListRepository.save(info);

        DisasterCatAssign assign = new DisasterCatAssign();
        assign.setNo(savedInfo.getNo());
        assign.setCatId(catId);
        disasterCatAssignRepository.save(assign);
    }

    @Transactional
    public void updateDisaster(DisasterInfo updatedInfo) throws Exception {
        DisasterInfo origin = disasterListRepository.findById(updatedInfo.getNo())
                .orElseThrow(() -> new IllegalArgumentException("수정할 정보가 존재하지 않습니다. no=" + updatedInfo.getNo()));

        origin.setTitle(updatedInfo.getTitle());
        origin.setLocationName(updatedInfo.getLocationName());
        origin.setContent(updatedInfo.getContent());
        origin.setDetailContent(updatedInfo.getDetailContent());
        origin.setDangerLevel(updatedInfo.getDangerLevel());
        origin.setLatitude(updatedInfo.getLatitude());
        origin.setLongitude(updatedInfo.getLongitude());
        origin.setSummary(updatedInfo.getSummary());
    }

    @Transactional
    public void deleteDisaster(long no) throws Exception {
        DisasterInfo info = disasterListRepository.findById(no)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 재난 정보가 존재하지 않습니다. no=" + no));
        disasterCatAssignRepository.deleteByNo(no);
        disasterListRepository.delete(info);
    }
}

