package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterCategoryRepository;
import com.disaster.api.disaster.repository.DisasterInfoRepository;
import com.disaster.api.disaster.vo.DisasterInfoRequestVO;
import com.disaster.api.disaster.vo.DisasterInfoVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisasterInfoService {

    private final DisasterInfoRepository disasterInfoRepository;
    private final DisasterCategoryRepository disasterCategoryRepository;

    // Entity -> VO 매핑
    public DisasterInfoVO entityToVO(DisasterInfo entity) {
        if (entity == null) return null;
        return DisasterInfoVO.builder()
                .id(entity.getId())
                .apiId(entity.getApiId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .location(entity.getLocation())
                .disasterDate(entity.getDisasterDate())
                .catid(entity.getCategory() != null ? entity.getCategory().getCatid() : null)
                .catName(entity.getCategory() != null ? entity.getCategory().getCatName() : null)
                .build();
    }

    // 카테고리별 재난 목록 전체 조회
    public List<DisasterInfoVO> getDisasterListByCategory(Long catid) {
        return disasterInfoRepository.findByCategoryCatidOrderByDisasterDateDesc(catid)
                .stream()
                .map(this::entityToVO)
                .collect(Collectors.toList());
    }

    // 카테고리별 재난 목록 페이징 조회
    public Page<DisasterInfoVO> getDisasterListByCategoryPaged(Long catid, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "disasterDate"));
        Page<DisasterInfo> disasterPage = disasterInfoRepository.findByCategoryCatid(catid, pageable);
        return disasterPage.map(this::entityToVO);
    }

    // 재난 정보 상세 조회 (단건)
    public DisasterInfoVO getDisasterDetail(Long id) {
        DisasterInfo entity = disasterInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 재난 정보입니다. id=" + id));

        return entityToVO(entity);
    }

    // [관리자] 재난 정보 등록
    @Transactional
    public Long createDisaster(DisasterInfoRequestVO requestVO) {
        DisasterCategory category = disasterCategoryRepository.findById(requestVO.getCatid())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다. catid=" + requestVO.getCatid()));

        DisasterInfo disasterInfo = new DisasterInfo();
        disasterInfo.setTitle(requestVO.getTitle());
        disasterInfo.setContent(requestVO.getContent());
        disasterInfo.setLocation(requestVO.getLocation());
        disasterInfo.setDisasterDate(requestVO.getDisasterDate());
        disasterInfo.setCategory(category);

        DisasterInfo savedEntity = disasterInfoRepository.save(disasterInfo);
        return savedEntity.getId();
    }

    // [관리자] 재난 정보 수정
    @Transactional
    public void updateDisaster(Long id, DisasterInfoRequestVO requestVO) {
        DisasterInfo disasterInfo = disasterInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 재난 정보입니다. id=" + id));

        DisasterCategory category = disasterCategoryRepository.findById(requestVO.getCatid())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다. catid=" + requestVO.getCatid()));

        disasterInfo.setTitle(requestVO.getTitle());
        disasterInfo.setContent(requestVO.getContent());
        disasterInfo.setLocation(requestVO.getLocation());
        disasterInfo.setDisasterDate(requestVO.getDisasterDate());
        disasterInfo.setCategory(category);
    }

    // [관리자] 재난 정보 삭제
    @Transactional
    public void deleteDisaster(Long id) {
        DisasterInfo disasterInfo = disasterInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 재난 정보입니다. id=" + id));
        disasterInfoRepository.delete(disasterInfo);
    }
}