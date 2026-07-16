package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.entity.DisasterInfo;
import com.disaster.api.disaster.service.DisasterListService;
import com.disaster.api.util.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/disasterList")
public class DisasterListController {

    private final DisasterListService disasterListService;

    public DisasterListController(DisasterListService disasterListService) {
        this.disasterListService = disasterListService;
    }

    @GetMapping("/list.do")
    public String list(
            @RequestParam(value = "catID", defaultValue = "1") int catID,
            HttpServletRequest request,
            Model model) {
        try {
            String headTitle = switch(catID) {
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
            List<DisasterInfo> list = disasterListService.getDisasterList(catID, pageObject);

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
}