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
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("회원 식별 정보가 없습니다.");
        }

        // 중복 스크랩 방지 검증
        if (disasterScrapRepository.existsByIdAndNo(memberId, no)) {
            throw new IllegalStateException("이미 스크랩한 재난 정보입니다.");
        }

        DisasterScrap scrap = new DisasterScrap();
        scrap.setId(memberId); // 회원 테이블의 PK(id)와 논리적으로 연결됨
        scrap.setNo(no);

        disasterScrapRepository.save(scrap);

    }

    // 2. 스크랩 취소
    @Transactional
    public void removeScrap(String memberId, Long no) {
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("회원 식별 정보가 없습니다.");
        }

        DisasterScrap scrap = disasterScrapRepository.findByIdAndNo(memberId, no)
                .orElseThrow(() -> new IllegalArgumentException("취소할 스크랩 내역을 찾을 수 없습니다."));

        disasterScrapRepository.delete(scrap);
    }

    // 3. 내 스크랩 목록 조회
    public Page<DisasterScrap> getMyScrapList(String memberId, Pageable pageable) {
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("회원 식별 정보가 없습니다.");
        }
        return disasterScrapRepository.findById(memberId, pageable);
    }

}