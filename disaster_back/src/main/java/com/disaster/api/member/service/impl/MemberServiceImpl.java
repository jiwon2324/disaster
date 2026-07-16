package com.disaster.api.member.service.impl;

import com.disaster.api.member.dto.MemberResponse;
import com.disaster.api.member.dto.MemberUpdateRequest;
import com.disaster.api.member.dto.PasswordChangeRequest;
import com.disaster.api.member.entity.Member;
import com.disaster.api.member.repository.QMemberRepository;
import com.disaster.api.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final QMemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public boolean isIdAvailable(String id) {

        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "아이디를 입력해 주세요."
            );
        }

        String trimmedId = id.trim();

        if (trimmedId.length() < 3 || trimmedId.length() > 20) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "아이디는 3자 이상 20자 이하로 입력해 주세요."
            );
        }

        return !memberRepository.existsById(trimmedId);
    }

    @Override
    public MemberResponse getMyInfo(String loginId) {
        Member member = findMember(loginId);
        return toResponse(member);
    }

    @Override
    @Transactional
    public MemberResponse updateMyInfo(
            String loginId,
            MemberUpdateRequest request
    ) {
        Member member = findMember(loginId);

        validateUpdateRequest(request);

        member.setName(request.getName().trim());
        member.setGender(request.getGender());
        member.setBirth(request.getBirth());
        member.setTel(normalizeNullable(request.getTel()));
        member.setEmail(request.getEmail().trim());

        return toResponse(member);
    }

    @Override
    @Transactional
    public void changePassword(
            String loginId,
            PasswordChangeRequest request
    ) {
        Member member = findMember(loginId);

        if (request == null
                || request.getCurrentPw() == null
                || request.getCurrentPw().isBlank()
                || request.getNewPw() == null
                || request.getNewPw().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "현재 비밀번호와 새 비밀번호를 입력해 주세요."
            );
        }

        if (!passwordEncoder.matches(
                request.getCurrentPw(),
                member.getPw()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "현재 비밀번호가 일치하지 않습니다."
            );
        }

        if (request.getNewPw().length() < 4
                || request.getNewPw().length() > 20) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "새 비밀번호는 4자 이상 20자 이하로 입력해 주세요."
            );
        }

        if (passwordEncoder.matches(
                request.getNewPw(),
                member.getPw()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "현재 비밀번호와 다른 비밀번호를 입력해 주세요."
            );
        }

        member.setPw(
                passwordEncoder.encode(request.getNewPw())
        );
    }

    @Override
    @Transactional
    public void withdraw(String loginId) {
        Member member = findMember(loginId);

        if ("탈퇴".equals(member.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 탈퇴한 회원입니다."
            );
        }

        member.setStatus("탈퇴");
    }

    private Member findMember(String loginId) {

        if (loginId == null || loginId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "로그인 정보가 없습니다."
            );
        }

        return memberRepository.findById(loginId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }

    private void validateUpdateRequest(
            MemberUpdateRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "수정할 회원 정보를 입력해 주세요."
            );
        }

        if (request.getName() == null
                || request.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이름을 입력해 주세요."
            );
        }

        String trimmedName = request.getName().trim();

        if (trimmedName.length() < 2
                || trimmedName.length() > 30) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이름은 2자 이상 30자 이하로 입력해 주세요."
            );
        }

        if (!"남자".equals(request.getGender())
                && !"여자".equals(request.getGender())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "성별은 남자 또는 여자만 입력할 수 있습니다."
            );
        }

        if (request.getBirth() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "생년월일을 입력해 주세요."
            );
        }

        if (request.getBirth().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "생년월일은 오늘 이후 날짜일 수 없습니다."
            );
        }

        if (request.getTel() != null
                && request.getTel().trim().length() > 13) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "전화번호는 13자 이하로 입력해 주세요."
            );
        }

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일을 입력해 주세요."
            );
        }

        if (request.getEmail().trim().length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일은 50자 이하로 입력해 주세요."
            );
        }
    }

    private String normalizeNullable(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }

    private MemberResponse toResponse(Member member) {

        Integer gradeNo = null;
        String gradeName = null;

        if (member.getGrade() != null) {
            gradeNo = member.getGrade().getGradeNo();
            gradeName = member.getGrade().getGradeName();
        }

        return MemberResponse.builder()
                .id(member.getId())
                .name(member.getName())
                .gender(member.getGender())
                .birth(member.getBirth())
                .tel(member.getTel())
                .email(member.getEmail())
                .regDate(member.getRegDate())
                .conDate(member.getConDate())
                .status(member.getStatus())
                .gradeNo(gradeNo)
                .gradeName(gradeName)
                .build();
    }
}