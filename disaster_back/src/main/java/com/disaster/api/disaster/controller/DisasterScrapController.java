package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterScrapService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
        // 세션에서 로그인한 회원 정보(memberId 등)를 가져옵니다.
        String memberId = (String) session.getAttribute("memberId");

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

        return "redirect:/disasterList/view.do?no=" + no;
    }
}