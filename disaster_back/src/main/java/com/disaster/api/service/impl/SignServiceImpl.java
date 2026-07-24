package com.disaster.api.service.impl;

import com.disaster.api.common.CommonResponse;
import com.disaster.api.config.security.JwtTokenProvider;
import com.disaster.api.data.dto.SignInResultDto;
import com.disaster.api.data.dto.SignUpResultDto;
import com.disaster.api.member.entity.Grade;
import com.disaster.api.member.entity.Member;
import com.disaster.api.member.repository.GradeRepository;
import com.disaster.api.member.repository.QMemberRepository;
import com.disaster.api.member.vo.MemberVO;
import com.disaster.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Log4j2
public class SignServiceImpl implements SignService {

    private static final String ID_PATTERN =
            "^[A-Za-z0-9]{3,20}$";

    private static final String NAME_PATTERN =
            "^[가-힣]{2,10}$";

    private static final String TEL_PATTERN =
            "^01[016789]-\\d{3,4}-\\d{4}$";

    private static final String EMAIL_PATTERN =
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private final QMemberRepository qMemberRepository;
    private final GradeRepository gradeRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public SignServiceImpl(
            QMemberRepository qMemberRepository,
            GradeRepository gradeRepository,
            JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder
    ) {
        this.qMemberRepository = qMemberRepository;
        this.gradeRepository = gradeRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SignUpResultDto signUp(MemberVO vo) {

        log.info(
                "[signUp] 회원가입 정보 전달 : vo = {}",
                vo
        );

        validateSignUpRequest(vo);

        String trimmedId =
                vo.getId().trim();

        if (qMemberRepository.existsById(
                trimmedId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 사용 중인 아이디입니다."
            );
        }

        String normalizedTel =
                normalizeOptional(
                        vo.getTel()
                );

        vo.setId(trimmedId);
        vo.setName(
                vo.getName().trim()
        );
        vo.setTel(normalizedTel);
        vo.setEmail(
                vo.getEmail().trim()
        );

        Grade defaultGrade =
                gradeRepository.findById(1)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.INTERNAL_SERVER_ERROR,
                                                "기본 회원등급 정보가 없습니다."
                                        )
                        );

        Member member = new Member();

        member.setId(vo.getId());
        member.setPw(
                passwordEncoder.encode(
                        vo.getPw()
                )
        );
        member.setName(vo.getName());
        member.setGender(
                vo.getGender()
        );
        member.setBirth(
                vo.getBirth()
        );
        member.setTel(vo.getTel());
        member.setEmail(
                vo.getEmail()
        );
        member.setStatus("정상");
        member.setGrade(defaultGrade);

        Member savedMember =
                qMemberRepository.save(
                        member
                );

        SignUpResultDto signUpResultDto =
                new SignUpResultDto();

        if (savedMember.getId() != null) {
            log.info(
                    "[signUp] 정상 회원가입 처리 완료"
            );
            setSuccessResult(
                    signUpResultDto
            );
        } else {
            log.info(
                    "[signUp] 회원가입 처리 실패"
            );
            setFailResult(
                    signUpResultDto
            );
        }

        return signUpResultDto;
    }

    @Override
    public SignInResultDto signIn(
            String id,
            String pw
    ) {

        if (
                id == null
                        || id.isBlank()
                        || pw == null
                        || pw.isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "아이디와 비밀번호를 입력해 주세요."
            );
        }

        String trimmedId = id.trim();

        log.info(
                "[signIn] 회원 정보 요청 - id : {}",
                trimmedId
        );

        Member member =
                qMemberRepository.findById(
                                trimmedId
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "아이디 또는 비밀번호가 올바르지 않습니다."
                                        )
                        );

        log.info(
                "[signIn] 패스워드 비교 수행"
        );

        if (!passwordEncoder.matches(
                pw,
                member.getPw()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }

        log.info(
                "[signIn] 패스워드 일치"
        );

        if (!"정상".equals(
                member.getStatus()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "로그인할 수 없는 회원 상태입니다."
            );
        }

        if (
                member.getGrade() == null
                        || member
                        .getGrade()
                        .getGradeNo() == null
        ) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "회원 등급 정보가 없습니다."
            );
        }

        Integer gradeNo =
                member
                        .getGrade()
                        .getGradeNo();

        List<String> roles;

        if (gradeNo == 9) {
            roles =
                    List.of(
                            "ROLE_ADMIN"
                    );
        } else if (gradeNo == 1) {
            roles =
                    List.of(
                            "ROLE_USER"
                    );
        } else {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "유효하지 않은 회원 등급입니다."
            );
        }

        member.setConDate(
                LocalDateTime.now()
        );
        qMemberRepository.save(member);

        SignInResultDto signInResultDto =
                SignInResultDto.builder()
                        .token(
                                jwtTokenProvider.createToken(
                                        member.getId(),
                                        member.getName(),
                                        roles
                                )
                        )
                        .build();

        setSuccessResult(
                signInResultDto
        );

        return signInResultDto;
    }

    private void validateSignUpRequest(
            MemberVO vo
    ) {
        if (vo == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "회원가입 정보를 입력해 주세요."
            );
        }

        String id =
                vo.getId() == null
                        ? ""
                        : vo.getId().trim();

        String pw =
                vo.getPw() == null
                        ? ""
                        : vo.getPw();

        String name =
                vo.getName() == null
                        ? ""
                        : vo.getName().trim();

        String gender =
                vo.getGender() == null
                        ? ""
                        : vo.getGender().trim();

        String tel =
                normalizeOptional(
                        vo.getTel()
                );

        String email =
                vo.getEmail() == null
                        ? ""
                        : vo.getEmail().trim();

        if (id.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "회원 아이디를 입력해 주세요."
            );
        }

        if (!id.matches(ID_PATTERN)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "아이디는 영문과 숫자만 사용하여 3자 이상 20자 이하로 입력해 주세요."
            );
        }

        if (pw.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "비밀번호를 입력해 주세요."
            );
        }

        if (
                pw.length() < 4
                        || pw.length() > 20
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "비밀번호는 4자 이상 20자 이하로 입력해 주세요."
            );
        }

        if (name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이름을 입력해 주세요."
            );
        }

        if (!name.matches(
                NAME_PATTERN
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이름은 한글 2자 이상 10자 이하로 입력해 주세요."
            );
        }

        if (
                !"남자".equals(gender)
                        && !"여자".equals(gender)
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "성별을 선택해 주세요."
            );
        }

        if (vo.getBirth() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "생년월일을 입력해 주세요."
            );
        }

        if (vo.getBirth().isAfter(
                LocalDate.now()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "생년월일은 오늘 이후 날짜로 입력할 수 없습니다."
            );
        }

        if (
                tel != null
                        && !tel.matches(
                        TEL_PATTERN
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "전화번호는 010-0000-0000 형식으로 입력해 주세요."
            );
        }

        if (email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일을 입력해 주세요."
            );
        }

        if (email.length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일은 50자 이하로 입력해 주세요."
            );
        }

        if (!email.matches(
                EMAIL_PATTERN
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일 형식이 올바르지 않습니다."
            );
        }
    }

    private String normalizeOptional(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private void setSuccessResult(
            SignUpResultDto result
    ) {
        result.setSuccess(true);
        result.setCode(
                CommonResponse.SUCCESS
                        .getCode()
        );
        result.setMsg(
                CommonResponse.SUCCESS
                        .getMsg()
        );
    }

    private void setFailResult(
            SignUpResultDto result
    ) {
        result.setSuccess(false);
        result.setCode(
                CommonResponse.FAIL
                        .getCode()
        );
        result.setMsg(
                CommonResponse.FAIL
                        .getMsg()
        );
    }
}