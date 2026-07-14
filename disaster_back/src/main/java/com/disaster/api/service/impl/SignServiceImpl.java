package com.disaster.api.service.impl;

import com.disaster.api.common.CommonResponse;
import com.disaster.api.config.security.JwtTokenProvider;
import com.disaster.api.data.dto.SignInResultDto;
import com.disaster.api.data.dto.SignUpResultDto;
import com.disaster.api.member.entity.Member;
import com.disaster.api.member.repository.QMemberRepository;
import com.disaster.api.member.vo.MemberVO;
import com.disaster.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Log4j2
public class SignServiceImpl implements SignService {

    private final QMemberRepository qMemberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public SignServiceImpl(
            QMemberRepository qMemberRepository,
            JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder
    ) {
        this.qMemberRepository = qMemberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SignUpResultDto signUp(MemberVO vo) {

        log.info("[signUp] 회원가입 정보 전달 : vo = {}", vo);

        Member member = new Member();

        member.setId(vo.getId());
        member.setPw(passwordEncoder.encode(vo.getPw()));
        member.setName(vo.getName());
        member.setGender(vo.getGender());
        member.setBirth(vo.getBirth());
        member.setTel(vo.getTel());
        member.setEmail(vo.getEmail());
        member.setStatus("정상");

        Member savedMember = qMemberRepository.save(member);

        SignUpResultDto signUpResultDto = new SignUpResultDto();

        if (savedMember != null && savedMember.getId() != null) {

            log.info("[signUp] 정상 회원가입 처리 완료");
            setSuccessResult(signUpResultDto);

        } else {

            log.info("[signUp] 회원가입 처리 실패");
            setFailResult(signUpResultDto);
        }

        return signUpResultDto;
    }

    @Override
    public SignInResultDto signIn(String id, String pw)
            throws RuntimeException {

        log.info("[signIn] 회원 정보 요청 - id : {}", id);

        Member member = qMemberRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("존재하지 않는 회원입니다."));

        log.info("[signIn] 패스워드 비교 수행");

        if (!passwordEncoder.matches(pw, member.getPw())) {
            throw new RuntimeException("패스워드가 다릅니다.");
        }

        log.info("[signIn] 패스워드 일치");

        // 최근 접속일 갱신
        member.setConDate(LocalDateTime.now());
        qMemberRepository.save(member);

        /*
         * 현재 Member에는 roles가 없고 Grade 엔티티를 사용하므로
         * 우선 일반 사용자 권한으로 토큰을 생성한다.
         */
        List<String> roles = List.of("ROLE_USER");

        SignInResultDto signInResultDto = SignInResultDto.builder()
                .token(
                        jwtTokenProvider.createToken(
                                member.getId(),
                                member.getName(),
                                roles
                        )
                )
                .build();

        setSuccessResult(signInResultDto);

        return signInResultDto;
    }

    private void setSuccessResult(SignUpResultDto result) {
        result.setSuccess(true);
        result.setCode(CommonResponse.SUCCESS.getCode());
        result.setMsg(CommonResponse.SUCCESS.getMsg());
    }

    private void setFailResult(SignUpResultDto result) {
        result.setSuccess(false);
        result.setCode(CommonResponse.FAIL.getCode());
        result.setMsg(CommonResponse.FAIL.getMsg());
    }
}