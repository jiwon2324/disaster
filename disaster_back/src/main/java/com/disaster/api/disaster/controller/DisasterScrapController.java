package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterScrapService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Tag(name = "DisasterScrap", description = "재난정보스크랩")
@Controller
@RequestMapping("/disasterScrap")
public class DisasterScrapController {

    private final DisasterScrapService disasterScrapService;

    public DisasterScrapController(DisasterScrapService disasterScrapService) {
        this.disasterScrapService = disasterScrapService;
    }

    // 스크랩 추가 요청 처리
    @PostMapping("/add.do")
    public String addScrap(
            @RequestParam("no") Long no,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {

        HttpSession session = request.getSession();
        String memberId = (String) session.getAttribute("memberId");

        /* [원래 코드] - 회원 기능 로그인 체크가 완성되면 아래 주석을 풀고 임시 코드를 제거하세요.
        if (memberId == null) {
            redirectAttributes.addFlashAttribute("msg", "로그인이 필요한 서비스입니다.");
            return "redirect:/member/login.do"; // 로그인 페이지 경로로 리다이렉트
        }

        try {
            disasterScrapService.addScrap(memberId, no);
            redirectAttributes.addFlashAttribute("msg", "스크랩에 성공하였습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("msg", e.getMessage());
        }
        */

        // ------------------ [임시 테스트 코드 시작] ------------------
        // 세션에 로그인 정보가 없다면 임시 회원으로 우회하여 스크랩을 수행하게 만듭니다.
        if (memberId == null || memberId.trim().isEmpty()) {
            memberId = "test_member";
        }

        try {
            disasterScrapService.addScrap(memberId, no);
            redirectAttributes.addFlashAttribute("msg", "임시 계정(test_member)으로 스크랩에 성공하였습니다.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("msg", e.getMessage());
        }
        // ------------------ [임시 테스트 코드 끝] ------------------

        return "redirect:/disasterList/view.do?no=" + no;
    }
}