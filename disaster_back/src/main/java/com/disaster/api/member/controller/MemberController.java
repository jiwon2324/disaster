package com.disaster.api.member.controller;

import com.disaster.api.data.dto.SignInResultDto;
import com.disaster.api.data.dto.SignUpResultDto;
import com.disaster.api.member.dto.MemberResponse;
import com.disaster.api.member.dto.MemberUpdateRequest;
import com.disaster.api.member.dto.PasswordChangeRequest;
import com.disaster.api.member.service.MemberService;
import com.disaster.api.member.vo.LoginVO;
import com.disaster.api.member.vo.MemberVO;
import com.disaster.api.service.SignService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Log4j2
public class MemberController {

    private final SignService signService;
    private final MemberService memberService;

    @PostMapping("/login.do")
    @Operation(summary = "로그인")
    public SignInResultDto login(
            @RequestBody LoginVO vo
    ) {
        String id = vo.getId();
        String pw = vo.getPw();

        log.info("[login] 로그인 시도, id : {}", id);

        return signService.signIn(id, pw);
    }

    @PostMapping("/write.do")
    @Operation(summary = "회원가입")
    public SignUpResultDto write(
            @RequestBody MemberVO vo
    ) {
        log.info("[signUp] 회원가입 수행, id : {}", vo.getId());

        return signService.signUp(vo);
    }

    @GetMapping("/check-id.do")
    @Operation(summary = "아이디 중복 확인")
    public Map<String, Object> checkId(
            @RequestParam String id
    ) {
        boolean available = memberService.isIdAvailable(id);

        return Map.of(
                "id", id,
                "available", available
        );
    }

    @GetMapping("/me.do")
    @Operation(summary = "내 회원정보 조회")
    public MemberResponse myInfo(
            Authentication authentication
    ) {
        return memberService.getMyInfo(
                authentication.getName()
        );
    }

    @PutMapping("/update.do")
    @Operation(summary = "내 회원정보 수정")
    public MemberResponse update(
            @RequestBody MemberUpdateRequest request,
            Authentication authentication
    ) {
        return memberService.updateMyInfo(
                authentication.getName(),
                request
        );
    }

    @PutMapping("/password.do")
    @Operation(summary = "비밀번호 변경")
    public Map<String, String> changePassword(
            @RequestBody PasswordChangeRequest request,
            Authentication authentication
    ) {
        memberService.changePassword(
                authentication.getName(),
                request
        );

        return Map.of(
                "message",
                "비밀번호가 변경되었습니다."
        );
    }

    @PutMapping("/withdraw.do")
    @Operation(summary = "회원 탈퇴")
    public Map<String, String> withdraw(
            Authentication authentication
    ) {
        memberService.withdraw(
                authentication.getName()
        );

        return Map.of(
                "message",
                "회원 탈퇴가 완료되었습니다."
        );
    }
}