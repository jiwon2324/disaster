package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.repository.DisasterCategoryRepository;
import com.disaster.api.disaster.vo.DisasterCategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisasterCategoryService {

    private final DisasterCategoryRepository disasterCategoryRepository;

    // Entity -> VO 변환 (조회용)
    public DisasterCategoryVO entityToVO(DisasterCategory entity) {
        if (entity == null) return null;
        return DisasterCategoryVO.builder()
                .catid(entity.getCatid())
                .catName(entity.getCatName())
                .build();
    }

    // VO -> Entity 변환 (등록용)
    public DisasterCategory voToEntity(DisasterCategoryVO vo) {
        if (vo == null) return null;
        DisasterCategory entity = new DisasterCategory();
        entity.setCatid(vo.getCatid());
        entity.setCatName(vo.getCatName());
        return entity;
    }

    // 1. 전체 카테고리 목록 조회
    public List<DisasterCategoryVO> getAllCategories() {
        return disasterCategoryRepository.findAll()
                .stream()
                .map(this::entityToVO)
                .collect(Collectors.toList());
    }

    // 2. 단건 조회 (수정 폼 불러오기용)
    public DisasterCategoryVO getCategoryById(Long catid) {
        DisasterCategory entity = disasterCategoryRepository.findById(catid)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다. catid=" + catid));
        return entityToVO(entity);
    }

    // 3. 카테고리 추가 (Create)
    @Transactional
    public void addCategory(DisasterCategoryVO vo) {
        DisasterCategory entity = voToEntity(vo);
        disasterCategoryRepository.save(entity);
    }

    // 4. 카테고리 수정 (Update - 더티 체킹 활용)
    @Transactional
    public void updateCategory(DisasterCategoryVO vo) {
        DisasterCategory entity = disasterCategoryRepository.findById(vo.getCatid())
                .orElseThrow(() -> new IllegalArgumentException("수정할 카테고리가 존재하지 않습니다. catid=" + vo.getCatid()));

        // 엔티티의 @Data (Lombok) 세터를 통해 값 변경 -> 감지 후 자동으로 DB UPDATE 쿼리 실행
        entity.setCatName(vo.getCatName());
    }

    // 5. 카테고리 삭제 (Delete)
    @Transactional
    public void deleteCategory(Long catid) {
        if (!disasterCategoryRepository.existsById(catid)) {
            throw new IllegalArgumentException("삭제할 카테고리가 존재하지 않습니다. catid=" + catid);
        }
        disasterCategoryRepository.deleteById(catid);
    }
}