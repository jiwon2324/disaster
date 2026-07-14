package com.disaster.api.guide.service;

import com.disaster.api.guide.entity.EduGuide;
import com.disaster.api.guide.repository.EduGuideRepository;
import com.disaster.api.guide.vo.EduGuideMetaVO;
import com.disaster.api.guide.vo.EduGuideVO;
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
public class EduGuideServiceImpl implements EduGuideService {

    private final EduGuideRepository eduGuideRepository;

    /**
     * 목록, 검색, 카테고리 필터, 페이징
     */
    @Override
    public Page<EduGuideVO> list(
            String word,
            String category,
            int page,
            int size
    ) {
        int pageNumber = Math.max(page - 1, 0);
        int pageSize = size > 0 ? size : 10;

        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(Sort.Direction.DESC, "no")
        );

        return eduGuideRepository
                .search(word, category, pageable)
                .map(EduGuideVO::fromEntity);
    }

    /**
     * 상세 조회 및 조회수 증가
     */
    @Override
    @Transactional
    public EduGuideVO view(Long no) {
        validateNo(no);

        if (!eduGuideRepository.existsById(no)) {
            throw new IllegalArgumentException(
                    "해당 교육 가이드를 찾을 수 없습니다. no=" + no
            );
        }

        eduGuideRepository.increaseHit(no);

        EduGuide guide = eduGuideRepository.findById(no)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "해당 교육 가이드를 찾을 수 없습니다. no=" + no
                        )
                );

        return EduGuideVO.fromEntity(guide);
    }

    /**
     * 등록
     */
    @Override
    @Transactional
    public EduGuideVO write(EduGuideVO vo) {
        validateRequiredFields(vo);

        EduGuide guide = vo.toEntity();

        if (guide.getHit() == null) {
            guide.setHit(0L);
        }

        if (guide.getStatus() == null
                || guide.getStatus().isBlank()) {
            guide.setStatus("PUBLIC");
        }

        EduGuide savedGuide = eduGuideRepository.save(guide);

        return EduGuideVO.fromEntity(savedGuide);
    }

    /**
     * 수정
     */
    @Override
    @Transactional
    public EduGuideVO update(Long no, EduGuideVO vo) {
        validateNo(no);
        validateRequiredFields(vo);

        EduGuide guide = eduGuideRepository.findById(no)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "수정할 교육 가이드를 찾을 수 없습니다. no=" + no
                        )
                );

        guide.setTitle(vo.getTitle());
        guide.setCategory(vo.getCategory());
        guide.setWriter(vo.getWriter());
        guide.setSummary(vo.getSummary());
        guide.setContent(vo.getContent());
        guide.setTags(vo.getTags());

        if (vo.getStatus() != null
                && !vo.getStatus().isBlank()) {
            guide.setStatus(vo.getStatus());
        }

        EduGuide savedGuide = eduGuideRepository.save(guide);

        return EduGuideVO.fromEntity(savedGuide);
    }

    /**
     * 삭제
     */
    @Override
    @Transactional
    public void delete(Long no) {
        validateNo(no);

        EduGuide guide = eduGuideRepository.findById(no)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "삭제할 교육 가이드를 찾을 수 없습니다. no=" + no
                        )
                );

        eduGuideRepository.delete(guide);
    }

    /**
     * 관리자 통계
     */
    @Override
    public EduGuideMetaVO getMetaData() {
        return EduGuideMetaVO.builder()
                .total(eduGuideRepository.count())
                .published(eduGuideRepository.countPublished())
                .draft(eduGuideRepository.countDraft())
                .views(eduGuideRepository.sumHit())
                .build();
    }

    private void validateNo(Long no) {
        if (no == null || no <= 0) {
            throw new IllegalArgumentException(
                    "올바른 교육 가이드 번호가 필요합니다."
            );
        }
    }

    private void validateRequiredFields(EduGuideVO vo) {
        if (vo == null) {
            throw new IllegalArgumentException(
                    "교육 가이드 데이터가 필요합니다."
            );
        }

        if (vo.getTitle() == null
                || vo.getTitle().isBlank()) {
            throw new IllegalArgumentException(
                    "제목은 필수입니다."
            );
        }

        if (vo.getWriter() == null
                || vo.getWriter().isBlank()) {
            throw new IllegalArgumentException(
                    "작성자는 필수입니다."
            );
        }

        if (vo.getSummary() == null
                || vo.getSummary().isBlank()) {
            throw new IllegalArgumentException(
                    "요약 내용은 필수입니다."
            );
        }

        if (vo.getContent() == null
                || vo.getContent().isBlank()) {
            throw new IllegalArgumentException(
                    "본문은 필수입니다."
            );
        }
    }
}