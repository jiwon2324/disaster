package com.disaster.api.member.controller;

import com.disaster.api.data.dto.SignInResultDto;
import com.disaster.api.data.dto.SignUpResultDto;
import com.disaster.api.member.dto.AdminMemberGradeRequest;
import com.disaster.api.member.dto.AdminMemberStatusRequest;
import com.disaster.api.member.dto.MemberResponse;
import com.disaster.api.member.dto.MemberUpdateRequest;
import com.disaster.api.member.dto.MemberWithdrawRequest;
import com.disaster.api.member.dto.PasswordChangeRequest;
import com.disaster.api.member.dto.PasswordFindRequest;
import com.disaster.api.member.service.MemberService;
import com.disaster.api.member.vo.LoginVO;
import com.disaster.api.member.vo.MemberVO;
import com.disaster.api.service.SignService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Log4j2
public class MemberController {

    private static final Set<Integer> ALLOWED_PAGE_SIZES =
            Set.of(10, 15, 20, 25);

    private final SignService signService;
    private final MemberService memberService;

    // =========================
    // 로그인 및 회원가입
    // =========================

    @PostMapping("/login.do")
    @Operation(summary = "로그인")
    public SignInResultDto login(
            @RequestBody LoginVO vo
    ) {
        log.info(
                "[login] 로그인 시도, id : {}",
                vo.getId()
        );

        return signService.signIn(
                vo.getId(),
                vo.getPw()
        );
    }

    @PostMapping("/write.do")
    @Operation(summary = "회원가입")
    public SignUpResultDto write(
            @RequestBody MemberVO vo
    ) {
        log.info(
                "[signUp] 회원가입 수행, id : {}",
                vo.getId()
        );

        return signService.signUp(vo);
    }

    @GetMapping("/check-id.do")
    @Operation(summary = "아이디 중복 확인")
    public Map<String, Object> checkId(
            @RequestParam String id
    ) {
        boolean available =
                memberService.isIdAvailable(id);

        return Map.of(
                "id", id,
                "available", available
        );
    }

    @PostMapping("/find-password.do")
    @Operation(summary = "비밀번호 찾기 및 임시 비밀번호 발송")
    public Map<String, String> findPassword(
            @RequestBody PasswordFindRequest request
    ) {
        memberService.findPassword(request);

        return Map.of(
                "message",
                "가입한 이메일로 임시 비밀번호를 발송했습니다."
        );
    }

    // =========================
    // 일반회원 기능
    // =========================

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
                "비밀번호가 변경되었습니다. 다시 로그인해 주세요."
        );
    }

    @PutMapping("/withdraw.do")
    @Operation(summary = "회원 탈퇴")
    public Map<String, String> withdraw(
            @RequestBody MemberWithdrawRequest request,
            Authentication authentication
    ) {
        memberService.withdraw(
                authentication.getName(),
                request
        );

        return Map.of(
                "message",
                "회원 탈퇴가 되었습니다."
        );
    }

    // =========================
    // 관리자 회원관리 기능
    // =========================

    @GetMapping("/admin/list.do")
    @Operation(summary = "관리자 회원 목록 및 검색")
    public Page<MemberResponse> adminMemberList(
            @RequestParam(defaultValue = "id")
            String searchType,

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            String status,

            @RequestParam(required = false)
            Integer gradeNo,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String sortDirection,

            Authentication authentication
    ) {
        int safePage =
                Math.max(page, 0);

        int safeSize =
                ALLOWED_PAGE_SIZES.contains(size)
                        ? size
                        : 10;

        String sortProperty =
                resolveSortProperty(sortBy);

        Sort.Direction direction =
                "desc".equalsIgnoreCase(
                        sortDirection
                )
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                direction,
                                sortProperty
                        )
                );

        return memberService.getMemberList(
                authentication.getName(),
                searchType,
                keyword,
                status,
                gradeNo,
                pageable
        );
    }

    @GetMapping("/admin/view.do")
    @Operation(summary = "관리자 회원 상세조회")
    public MemberResponse adminMemberDetail(
            @RequestParam String id
    ) {
        return memberService.getMemberDetail(id);
    }

    @PutMapping("/admin/status.do")
    @Operation(summary = "관리자 회원 상태 변경")
    public MemberResponse adminUpdateStatus(
            @RequestParam String id,
            @RequestBody AdminMemberStatusRequest request,
            Authentication authentication
    ) {
        if (authentication.getName().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "관리자 본인의 상태는 변경할 수 없습니다."
            );
        }

        return memberService.updateMemberStatus(
                id,
                request
        );
    }

    @PutMapping("/admin/grade.do")
    @Operation(summary = "관리자 회원 등급 변경")
    public MemberResponse adminUpdateGrade(
            @RequestParam String id,
            @RequestBody AdminMemberGradeRequest request,
            Authentication authentication
    ) {
        if (authentication.getName().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "관리자 본인의 등급은 변경할 수 없습니다."
            );
        }

        return memberService.updateMemberGrade(
                id,
                request
        );
    }

    private String resolveSortProperty(
            String sortBy
    ) {
        if (sortBy == null) {
            return "id";
        }

        return switch (sortBy) {
            case "id" -> "id";
            case "name" -> "name";
            case "gender" -> "gender";
            case "birth" -> "birth";
            case "tel" -> "tel";
            case "status" -> "status";
            case "gradeNo" -> "grade.gradeNo";
            case "gradeName" -> "grade.gradeName";
            case "conDate" -> "conDate";
            default -> "id";
        };
    }
}