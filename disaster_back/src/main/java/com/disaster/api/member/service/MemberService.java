package com.disaster.api.member.service;

import com.disaster.api.member.dto.AdminMemberGradeRequest;
import com.disaster.api.member.dto.AdminMemberStatusRequest;
import com.disaster.api.member.dto.MemberResponse;
import com.disaster.api.member.dto.MemberUpdateRequest;
import com.disaster.api.member.dto.MemberWithdrawRequest;
import com.disaster.api.member.dto.PasswordChangeRequest;
import com.disaster.api.member.dto.PasswordFindRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {

    // 일반회원 기능
    boolean isIdAvailable(String id);

    MemberResponse getMyInfo(String loginId);

    MemberResponse updateMyInfo(
            String loginId,
            MemberUpdateRequest request
    );

    void changePassword(
            String loginId,
            PasswordChangeRequest request
    );

    void findPassword(
            PasswordFindRequest request
    );

    void withdraw(
            String loginId,
            MemberWithdrawRequest request
    );

    // 관리자 회원관리 기능
    Page<MemberResponse> getMemberList(
            String loginId,
            String searchType,
            String keyword,
            String status,
            Integer gradeNo,
            Pageable pageable
    );

    MemberResponse getMemberDetail(String id);

    MemberResponse updateMemberStatus(
            String id,
            AdminMemberStatusRequest request
    );

    MemberResponse updateMemberGrade(
            String id,
            AdminMemberGradeRequest request
    );
}