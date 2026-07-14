package com.disaster.api.checklist.service;

import com.disaster.api.checklist.entity.Checklist;
import com.disaster.api.checklist.repository.ChecklistRepository;
import com.disaster.api.checklist.vo.ChecklistMetaVO;
import com.disaster.api.checklist.vo.ChecklistVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistRepository checklistRepository;

    @Override
    public Page<ChecklistVO> list(
            String id,
            String word,
            String category,
            int page,
            int size
    ) {
        validateMemberId(id);

        int pageNumber = Math.max(page - 1, 0);
        int pageSize = size > 0 ? size : 10;

        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(Sort.Direction.DESC, "no")
        );

        return checklistRepository
                .search(id, word, category, pageable)
                .map(ChecklistVO::fromEntity);
    }

    @Override
    public ChecklistVO view(Long no) {
        return ChecklistVO.fromEntity(findChecklist(no));
    }

    @Override
    @Transactional
    public ChecklistVO write(ChecklistVO vo) {
        validateWriteData(vo);

        Checklist checklist = vo.toEntity();

        if (checklist.getQuantity() == null
                || checklist.getQuantity() < 1) {
            checklist.setQuantity(1);
        }

        if (checklist.getIsReady() == null
                || checklist.getIsReady().isBlank()) {
            checklist.setIsReady("N");
        }

        validateReadyStatus(checklist.getIsReady());

        Checklist savedChecklist =
                checklistRepository.save(checklist);

        return ChecklistVO.fromEntity(savedChecklist);
    }

    @Override
    @Transactional
    public ChecklistVO update(
            Long no,
            ChecklistVO vo
    ) {
        validateWriteData(vo);

        Checklist checklist = findChecklist(no);

        checklist.setName(vo.getName());
        checklist.setCategory(vo.getCategory());
        checklist.setQuantity(vo.getQuantity());
        checklist.setUnit(vo.getUnit());
        checklist.setPriority(vo.getPriority());
        checklist.setExpiryDate(vo.getExpiryDate());
        checklist.setMemo(vo.getMemo());

        if (vo.getIsReady() != null
                && !vo.getIsReady().isBlank()) {
            validateReadyStatus(vo.getIsReady());
            checklist.setIsReady(vo.getIsReady());
        }

        Checklist savedChecklist =
                checklistRepository.save(checklist);

        return ChecklistVO.fromEntity(savedChecklist);
    }

    @Override
    @Transactional
    public ChecklistVO changeReady(
            Long no,
            String isReady
    ) {
        validateReadyStatus(isReady);

        Checklist checklist = findChecklist(no);
        checklist.setIsReady(isReady);

        Checklist savedChecklist =
                checklistRepository.save(checklist);

        return ChecklistVO.fromEntity(savedChecklist);
    }

    @Override
    @Transactional
    public void delete(Long no) {
        Checklist checklist = findChecklist(no);
        checklistRepository.delete(checklist);
    }

    @Override
    public ChecklistMetaVO getMetaData(String id) {
        validateMemberId(id);

        long total = checklistRepository.countById(id);
        long ready =
                checklistRepository.countByIdAndIsReady(id, "Y");
        long notReady =
                checklistRepository.countByIdAndIsReady(id, "N");

        return ChecklistMetaVO.builder()
                .total(total)
                .ready(ready)
                .notReady(notReady)
                .build();
    }

    private Checklist findChecklist(Long no) {
        if (no == null || no <= 0) {
            throw new IllegalArgumentException(
                    "올바른 체크리스트 번호가 필요합니다."
            );
        }

        return checklistRepository.findById(no)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "체크리스트 물품을 찾을 수 없습니다. no=" + no
                        )
                );
    }

    private void validateWriteData(ChecklistVO vo) {
        if (vo == null) {
            throw new IllegalArgumentException(
                    "체크리스트 데이터가 필요합니다."
            );
        }

        validateMemberId(vo.getId());

        if (vo.getName() == null
                || vo.getName().isBlank()) {
            throw new IllegalArgumentException(
                    "물품명은 필수입니다."
            );
        }

        if (vo.getQuantity() != null
                && vo.getQuantity() < 1) {
            throw new IllegalArgumentException(
                    "수량은 1개 이상이어야 합니다."
            );
        }
    }

    private void validateMemberId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException(
                    "회원 아이디가 필요합니다."
            );
        }
    }

    private void validateReadyStatus(String isReady) {
        if (!"Y".equals(isReady)
                && !"N".equals(isReady)) {
            throw new IllegalArgumentException(
                    "구비 여부는 Y 또는 N만 가능합니다."
            );
        }
    }
}