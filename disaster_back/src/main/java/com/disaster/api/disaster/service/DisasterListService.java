package com.disaster.api.disaster.service;

import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.repository.DisasterListRepository;
import com.disaster.api.util.page.PageObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public class DisasterListService {
    @Service
    @Transactional(readOnly = true)
    public static class DisasterListService {

        private final DisasterListRepository disasterListRepository;

        public DisasterListService(DisasterListRepository disasterListRepository) {
            this.disasterListRepository = disasterListRepository;
        }

        @Transactional
        public List<DisasterInfo> getDisasterList(int catID, PageObject pageObject) throws Exception {
            // 기존 PageObject의 시작 페이지는 1부터 시작하지만, Spring Data JPA의 PageRequest는 0-index 기반입니다.
            int jpaPage = (int) pageObject.getPage() - 1;
            if (jpaPage < 0) jpaPage = 0;

            int jpaSize = (int) pageObject.getPerPageNum();

            // 1. Spring Pageable 생성 (내림차순 정렬 포함)
            Pageable pageable = PageRequest.of(jpaPage, jpaSize, Sort.by(Sort.Direction.DESC, "no"));

            // 2. Repository 호출을 통한 페이징 및 검색 수행
            Page<DisasterInfo> resultPage = disasterListRepository.findDisasters(
                    catID,
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
    }
}
