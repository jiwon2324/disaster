package com.disaster.api.member.service;

import com.disaster.api.member.dto.MemberResponse;
import com.disaster.api.member.dto.MemberUpdateRequest;
import com.disaster.api.member.dto.PasswordChangeRequest;

public interface MemberService {

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

    void withdraw(String loginId);
}