package com.disaster.api.service;

import com.disaster.api.data.dto.SignInResultDto;
import com.disaster.api.data.dto.SignUpResultDto;
import com.disaster.api.member.vo.MemberVO;

public interface SignService {

    //회원가입
    SignUpResultDto signUp(MemberVO vo);

    // 로그인
    SignInResultDto signIn(String id, String pw) throws RuntimeException;

}
