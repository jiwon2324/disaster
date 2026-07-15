package com.disaster.api.service.impl;

import com.disaster.api.data.entity.UserDetails;
import com.disaster.api.member.entity.Member;
import com.disaster.api.member.repository.QMemberRepository;
import com.disaster.api.member.security.MemberUserDetails;
import com.disaster.api.service.UserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final int USER_GRADE_NO = 1;
    private static final int ADMIN_GRADE_NO = 9;

    private final QMemberRepository qMemberRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        log.info("[loadUserByUsername] member 테이블 회원 조회, id : {}", username);

        Member member = qMemberRepository.findById(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "존재하지 않는 회원입니다."
                        )
                );

        if (!"정상".equals(member.getStatus())) {
            throw new UsernameNotFoundException(
                    "로그인할 수 없는 회원 상태입니다."
            );
        }

        if (member.getGrade() == null
                || member.getGrade().getGradeNo() == null) {
            throw new UsernameNotFoundException(
                    "회원 등급 정보가 없습니다."
            );
        }

        int gradeNo = member.getGrade().getGradeNo();
        List<String> roles;

        if (gradeNo == ADMIN_GRADE_NO) {
            roles = List.of("ROLE_ADMIN");
        } else if (gradeNo == USER_GRADE_NO) {
            roles = List.of("ROLE_USER");
        } else {
            throw new UsernameNotFoundException(
                    "유효하지 않은 회원 등급입니다."
            );
        }

        return new MemberUserDetails(
                member.getId(),
                member.getPw(),
                roles
        );
    }
}