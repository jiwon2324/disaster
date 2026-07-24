package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.entity.DisasterScrap;
import com.disaster.api.disaster.repository.DisasterInfoRepository;
import com.disaster.api.disaster.repository.DisasterScrapRepository;
import com.disaster.api.disaster.vo.DisasterScrapVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisasterScrapService {

    private final DisasterScrapRepository disasterScrapRepository;
    private final DisasterInfoRepository disasterInfoRepository;

    // 1. 스크랩 추가
    @Transactional
    public Long add(String memberId, Long disasterNo) {
        if (disasterScrapRepository.existsByIdAndDisasterInfo_Id(memberId, disasterNo)) {
            throw new IllegalStateException("이미 스크랩한 재난 정보입니다.");
        }

        DisasterInfo disasterInfo = disasterInfoRepository.findById(disasterNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 재난 정보입니다. ID=" + disasterNo));

        DisasterScrap scrap = new DisasterScrap();
        scrap.setId(memberId);
        scrap.setDisasterInfo(disasterInfo);
        scrap.setNo(disasterNo);

        return disasterScrapRepository.save(scrap).getScrapNo();
    }

    // 2. 스크랩 취소/삭제
    @Transactional
    public void remove(String memberId, Long disasterNo) {
        disasterScrapRepository.deleteByIdAndDisasterInfo_Id(memberId, disasterNo);
    }

    // 3. 내 스크랩 목록 조회
    public List<DisasterScrapVO> list(String memberId) {
        List<DisasterScrap> scrapList = disasterScrapRepository.findByIdOrderByScrapDateDesc(memberId);

        return scrapList.stream().map(scrap -> {
            DisasterInfo info = scrap.getDisasterInfo();
            return DisasterScrapVO.builder()
                    .scrapNo(scrap.getScrapNo())
                    .id(scrap.getId())
                    .no(info != null ? info.getId() : null)
                    .title(info != null ? info.getTitle() : "삭제된 정보")
                    .content(info != null ? info.getContent() : "")
                    .location(info != null ? info.getLocation() : "")
                    .disasterDate(info != null ? info.getDisasterDate() : null)
                    .categoryName(info != null && info.getCategory() != null ? info.getCategory().getCatName() : null)
                    .scrapDate(scrap.getScrapDate())
                    .build();
        }).collect(Collectors.toList());
    }

    // 4. 스크랩 여부 체크
    public boolean check(String memberId, Long disasterNo) {
        return disasterScrapRepository.existsByIdAndDisasterInfo_Id(memberId, disasterNo);
    }
}