package com.disaster.api.community.service;

import com.querydsl.core.Tuple;
import com.disaster.api.community.entity.Community;
import com.disaster.api.community.repository.CommunityRepositoryCustom;
import com.disaster.api.community.repository.QCommunityRepository;
import com.disaster.api.community.vo.CommunityVO;
import com.disaster.api.util.page.PageObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Log4j2
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepositoryCustom communityRepositoryCustom;
    private final QCommunityRepository qCommunityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<CommunityVO> list(PageObject pageObject) {
        pageObject.setTotalRow(communityRepositoryCustom.getCount(pageObject.getKey(), pageObject.getWord()));

        List<Tuple> tupleList = communityRepositoryCustom.getList(
                pageObject.getPage(),
                pageObject.getPerPageNum(),
                pageObject.getKey(),
                pageObject.getWord()
        );

        List<CommunityVO> list = new ArrayList<>();
        for (Tuple tuple : tupleList) {
            CommunityVO vo = new CommunityVO();
            vo.setNo(tuple.get(0, Long.class));
            vo.setTitle(tuple.get(1, String.class));
            vo.setWriter(tuple.get(2, String.class));
            vo.setHit(tuple.get(3, Long.class));
            vo.setWriteDate(tuple.get(4, LocalDateTime.class));
            vo.setFileName(tuple.get(5, String.class));
            list.add(vo);
        }
        return list;
    }

    @Override
    @Transactional
    public CommunityVO view(Long no, Integer inc) {
        if (inc == 1) communityRepositoryCustom.increaseHit(no);
        Tuple tuple = communityRepositoryCustom.getCommunity(no);
        CommunityVO vo = new CommunityVO();
        vo.setNo(tuple.get(0, Long.class));
        vo.setTitle(tuple.get(1, String.class));
        vo.setContent(tuple.get(2, String.class));
        vo.setWriter(tuple.get(3, String.class));
        vo.setWriteDate(tuple.get(4, LocalDateTime.class));
        vo.setHit(tuple.get(5, Long.class));
        vo.setFileName(tuple.get(6, String.class));
        return vo;
    }

    CommunityVO communityToVO(Community entity) {
        CommunityVO vo = new CommunityVO();
        vo.setNo(entity.getNo());
        vo.setTitle(entity.getTitle());
        vo.setContent(entity.getContent());
        vo.setWriter(entity.getWriter());
        vo.setHit(entity.getHit());
        vo.setWriteDate(entity.getWriteDate());
        vo.setFileName(entity.getFileName());
        return vo;
    }

    Community voToCommunity(CommunityVO vo) {
        Community entity = new Community();
        entity.setNo(vo.getNo());
        entity.setTitle(vo.getTitle());
        entity.setContent(vo.getContent());
        entity.setWriter(vo.getWriter());
        entity.setPw(passwordEncoder.encode(vo.getPw()));
        entity.setFileName(vo.getFileName());
        return entity;
    }

    @Override
    @Transactional
    public CommunityVO write(CommunityVO vo) {
        Community entity = communityRepositoryCustom.writeCommunity(voToCommunity(vo));
        return communityToVO(entity);
    }

    @Override
    @Transactional
    public Long update(CommunityVO vo) {
        Optional<Community> optional = qCommunityRepository.findById(vo.getNo());
        if (optional.isEmpty()) throw new RuntimeException("제보게시판 수정 오류 - 잘못된 글번호");
        Community entity = optional.get();

        // 1. 기존 비밀번호 검증
        if (!passwordEncoder.matches(vo.getPw(), entity.getPw())) {
            throw new RuntimeException("제보게시판 수정 오류 - 비밀번호가 일치하지 않습니다.");
        }

        // 2. 🛡️ 작성자 일치 여부 2차 검증 (보안 강화)
        if (!entity.getWriter().equals(vo.getWriter())) {
            throw new RuntimeException("제보게시판 수정 오류 - 타인의 글은 수정할 수 없습니다.");
        }

        return communityRepositoryCustom.updateCommunity(vo.getTitle(), vo.getContent(), vo.getWriter(), vo.getNo());
    }

    @Override
    @Transactional
    public String delete(CommunityVO vo) {
        Optional<Community> optional = qCommunityRepository.findById(vo.getNo());
        if (optional.isEmpty()) throw new RuntimeException("제보게시판 삭제 오류 - 잘못된 글번호");
        Community entity = optional.get();

        // 🔑 [관리자 패스 추가] 요청한 유저가 관리자 권한을 가졌는지 확인
        // 프론트엔드 토큰 구조 및 사용 예시에 맞춰 admin, admin01, 관리자 키워드를 허용합니다.
        boolean isAdmin = vo.getWriter() != null && (
                vo.getWriter().equals("admin") ||
                        vo.getWriter().equals("admin01") ||
                        vo.getWriter().equals("관리자")
        );

        // 🛡️ 관리자가 아닐 때만 비밀번호와 작성자 매칭 검증 실행
        if (!isAdmin) {
            // 1. 기존 비밀번호 검증
            if (!passwordEncoder.matches(vo.getPw(), entity.getPw())) {
                throw new RuntimeException("제보게시판 삭제 오류 - 비밀번호가 일치하지 않습니다.");
            }

            // 2. 작성자 일치 여부 2차 검증
            if (!entity.getWriter().equals(vo.getWriter())) {
                throw new RuntimeException("제보게시판 삭제 오류 - 타인의 글은 삭제할 수 없습니다.");
            }
        }

        communityRepositoryCustom.deleteCommunity(vo.getNo());
        return entity.getFileName();
    }

    @Override
    @Transactional
    public Long changeImage(CommunityVO vo) {
        return communityRepositoryCustom.changeImage(vo.getNo(), vo.getFileName());
    }
}