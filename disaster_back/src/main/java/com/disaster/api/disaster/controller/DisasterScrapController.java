package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterScrapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Tag(name = "DisasterScrap", description = "재난정보스크랩")
@Controller
@RequestMapping("/disasterScrap")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterScrapController {

    private final DisasterScrapService disasterScrapService;

    public DisasterScrapController(DisasterScrapService disasterScrapService) {
        this.disasterScrapService = disasterScrapService;
    }

    // 스크랩 추가 요청 처리
    @Operation(summary = "스크랩 추가", description = "로그인한 사용자가 특정 재난 정보를 스크랩합니다.")
    @PostMapping("/add.do")
    public String addScrap(
            @RequestParam("no") Long no,
            HttpServletRequest request,
            RedirectAttributes rttr) {

        HttpSession session = request.getSession();
        String memberId = (String) session.getAttribute("memberId");

        // 1. 로그인 안됐을 때
        if (memberId == null || memberId.trim().isEmpty()) {
            rttr.addFlashAttribute("msg", "로그인이 필요한 서비스입니다.");
            return "redirect:/member/login.do"; // 로그인 페이지 경로로 리다이렉트
        }

        // 2. 스크랩 추가
        try {
            disasterScrapService.addScrap(memberId, no);
            rttr.addFlashAttribute("msg", "스크랩에 성공하였습니다.");
        } catch (Exception e) {
            rttr.addFlashAttribute("msg", e.getMessage());
        }

        return "redirect:/disasterList/view.do?no=" + no;
    }
    @Operation(summary = "스크랩 취소", description = "로그인한 사용자가 등록한 스크랩을 삭제합니다.")
    @PostMapping("/delete.do")
    public String removeScrap(@RequestParam("no") Long no, HttpServletRequest request, RedirectAttributes rttr) {
        HttpSession session = request.getSession();
        String memberId = (String) session.getAttribute("memberId");

        // 1. 로그인 체크 방어 로직
        if (memberId == null || memberId.trim().isEmpty()) {
            rttr.addFlashAttribute("msg", "로그인이 필요한 서비스입니다.");
            return "redirect:/member/login.do";
        }

        // 2. 스크랩 삭제 시도
        try {
            disasterScrapService.removeScrap(memberId, no);
            rttr.addFlashAttribute("msg", "스크랩이 취소되었습니다.");
        } catch (Exception e) {
            rttr.addFlashAttribute("msg", e.getMessage());
        }

        return "redirect:/disasterList/view.do?no=" + no;
    }
}