package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterScrap;
import com.disaster.api.disaster.repository.DisasterScrapRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DisasterScrapService {

    private final DisasterScrapRepository disasterScrapRepository;

    public DisasterScrapService(DisasterScrapRepository disasterScrapRepository) {
        this.disasterScrapRepository = disasterScrapRepository;
    }

    // 1. 스크랩 등록
    @Transactional
    public void addScrap(String memberId, Long no) {
        if (disasterScrapRepository.existsByMemberIdAndNo(memberId, no)) {
            throw new IllegalStateException("이미 스크랩한 재난 정보입니다.");
        }

        DisasterScrap scrap = new DisasterScrap();
        // DisasterScrap 엔티티 내부 필드 세터 호출 (memberId, no, 등록일 등)
        // 예: scrap.setMemberId(memberId);
        //     scrap.setNo(no);

        disasterScrapRepository.save(scrap);
    }

    // 2. 스크랩 취소
    @Transactional
    public void removeScrap(String memberId, Long no) {
        DisasterScrap scrap = disasterScrapRepository.findByMemberIdAndNo(memberId, no)
                .orElseThrow(() -> new IllegalArgumentException("스크랩 내역을 찾을 수 없습니다."));
        disasterScrapRepository.delete(scrap);
    }

    // 3. 내 스크랩 목록 조회
    public Page<DisasterScrap> getMyScrapList(String memberId, Pageable pageable) {
        return disasterScrapRepository.findByMemberId(memberId, pageable);
    }
}