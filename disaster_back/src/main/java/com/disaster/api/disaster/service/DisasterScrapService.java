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
        /* [원래 코드] - 회원 기능 연동 시 주석 해제 후 아래 임시 코드를 제거하세요.
        if (disasterScrapRepository.existsByIdAndNo(memberId, no)) {
            throw new IllegalStateException("이미 스크랩한 재난 정보입니다.");
        }

        DisasterScrap scrap = new DisasterScrap();
        scrap.setId(memberId); // setMemberId 대신 setId 사용
        scrap.setNo(no);

        disasterScrapRepository.save(scrap);
        */

        // ------------------ [임시 테스트 코드 시작] ------------------
        if (memberId == null || memberId.trim().isEmpty()) {
            memberId = "test_member";
        }

        if (disasterScrapRepository.existsByIdAndNo(memberId, no)) {
            throw new IllegalStateException("이미 스크랩한 재난 정보입니다.");
        }

        DisasterScrap scrap = new DisasterScrap();
        scrap.setId(memberId); // 엔티티 필드인 id에 맞춰 setId로 바인딩!
        scrap.setNo(no);

        disasterScrapRepository.save(scrap);
        // ------------------ [임시 테스트 코드 끝] ------------------
    }

    // 2. 스크랩 취소
    @Transactional
    public void removeScrap(String memberId, Long no) {
        /* [원래 코드] - 회원 기능 연동 시 주석 해제 후 아래 임시 코드를 제거하세요.
        DisasterScrap scrap = disasterScrapRepository.findByIdAndNo(memberId, no)
                .orElseThrow(() -> new IllegalArgumentException("스크랩 내역을 찾을 수 없습니다."));
        disasterScrapRepository.delete(scrap);
        */

        // ------------------ [임시 테스트 코드 시작] ------------------
        if (memberId == null || memberId.trim().isEmpty()) {
            memberId = "test_member";
        }

        DisasterScrap scrap = disasterScrapRepository.findByIdAndNo(memberId, no)
                .orElseThrow(() -> new IllegalArgumentException("스크랩 내역을 찾을 수 없습니다."));
        disasterScrapRepository.delete(scrap);
        // ------------------ [임시 테스트 코드 끝] ------------------
    }

    // 3. 내 스크랩 목록 조회
    public Page<DisasterScrap> getMyScrapList(String memberId, Pageable pageable) {
        /* [원래 코드] - 회원 기능 연동 시 주석 해제 후 아래 임시 코드를 제거하세요.
        return disasterScrapRepository.findById(memberId, pageable);
        */

        // ------------------ [임시 테스트 코드 시작] ------------------
        if (memberId == null || memberId.trim().isEmpty()) {
            memberId = "test_member";
        }
        return disasterScrapRepository.findById(memberId, pageable);
        // ------------------ [임시 테스트 코드 끝] ------------------
    }
}