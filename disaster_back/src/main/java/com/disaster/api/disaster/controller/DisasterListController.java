package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.service.DisasterListService;
import com.disaster.api.util.page.PageObject;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Tag(name = "DisasterList", description = "재난정보리스트")
@Controller
@RequestMapping("/disasterList")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterListController {

    private final DisasterListService disasterListService;

    public DisasterListController(DisasterListService disasterListService) {
        this.disasterListService = disasterListService;
    }

    @Operation(summary = "재난 목록 조회", description = "카테고리별 재난 목록을 조회합니다.")
    @GetMapping("/list.do")
    public String list(
            @RequestParam(value = "catId", defaultValue = "1") Long catId,
            HttpServletRequest request,
            Model model) {
        try {
            String headTitle = switch(catId.intValue()) {
                case 1 -> "피해/폭발(산불 포함)";
                case 2 -> "지진/해일";
                case 3 -> "태풍/호우(폭풍, 홍수 포함)";
                case 4 -> "폭염/한파(기온 관련)";
                case 5 -> "산사태/붕괴/낙석";
                case 6 -> "교통/사고/통제";
                case 7 -> "단수/정전/통신망장애";
                case 8 -> "실종/수색";
                default -> "기타 재난";
            };
            model.addAttribute("headTitle", headTitle);

            PageObject pageObject = PageObject.getInstance(request);
            List<DisasterInfo> list = disasterListService.getDisasterList(catId, pageObject);

            model.addAttribute("list", list);
            model.addAttribute("pageObject", pageObject);
            model.addAttribute("url", request.getRequestURL());

            return "disasterList/list";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("moduleName", "재난안전 목록");
            model.addAttribute("e", e);
            return "error/err_500";
        }
    }

    @Operation(summary = "재난 상세 조회", description = "선택한 재난의 상세 정보를 조회합니다.")
    @GetMapping("/view.do")
    public String view(
            @RequestParam("no") long no,
            @RequestParam(value = "inc", defaultValue = "0") long inc,
            Model model) {
        try {
            DisasterInfo info = disasterListService.getDisasterDetail(no, inc);
            model.addAttribute("vo", info);
            return "disasterList/view";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("moduleName", "재난안전 상세보기");
            model.addAttribute("e", e);
            return "error/err_500";
        }
    }
    @Operation(summary = "긴급 재난 정보 수동 등록 폼", description = "관리자가 수동으로 재난을 등록하는 폼 화면입니다.")
    @GetMapping("/write.do")
    public String writeForm(Model model) {
        model.addAttribute("info", new DisasterInfo());
        return "disasterList/write";
    }

    @Operation(summary = "긴급 재난 정보 수동 등록 처리", description = "API 장애 대비 관리자가 수동으로 재난을 등록합니다.")
    @PostMapping("/write.do")
    public String write(@ModelAttribute DisasterInfo info, @RequestParam("catId") Long catId, RedirectAttributes rttr) {
        try {
            disasterListService.registerDisaster(info, catId);
            rttr.addFlashAttribute("msg", "새로운 재난 정보가 성공적으로 등록되었습니다.");
            return "redirect:/disasterList/list.do?catId=" + catId;
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("errorMsg", "등록에 실패했습니다.");
            return "redirect:/disasterList/write.do";
        }
    }

    @Operation(summary = "재난 정보 수정 폼", description = "오타나 잘못된 정보를 관리자가 수정하는 폼 화면입니다.")
    @GetMapping("/update.do")
    public String updateForm(@RequestParam("no") long no, Model model) {
        try {
            DisasterInfo info = disasterListService.getDisasterDetail(no, 0);
            model.addAttribute("vo", info);
            return "disasterList/update";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("moduleName", "재난안전 수정 폼");
            model.addAttribute("e", e);
            return "error/err_500";
        }
    }

    @Operation(summary = "재난 정보 수정 처리", description = "수정된 재난 정보를 DB에 반영합니다.")
    @PostMapping("/update.do")
    public String update(@ModelAttribute DisasterInfo info, @RequestParam(value = "catId", defaultValue = "1") Long catId, RedirectAttributes rttr) {
        try {
            disasterListService.updateDisaster(info);
            rttr.addFlashAttribute("msg", "정보가 정상적으로 수정되었습니다.");
            return "redirect:/disasterList/view.do?no=" + info.getNo();
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("errorMsg", "수정에 실패했습니다.");
            return "redirect:/disasterList/update.do?no=" + info.getNo();
        }
    }

    @Operation(summary = "재난 정보 삭제 처리", description = "테스트 데이터나 불필요한 재난 정보를 DB에서 영구 삭제합니다.")
    @PostMapping("/delete.do")
    public String delete(@RequestParam("no") long no, @RequestParam(value = "catId", defaultValue = "1") Long catId, RedirectAttributes rttr) {
        try {
            disasterListService.deleteDisaster(no);
            rttr.addFlashAttribute("msg", "성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("errorMsg", "삭제 도중 에러가 발생했습니다.");
        }
        return "redirect:/disasterList/list.do?catId=" + catId;
    }
}