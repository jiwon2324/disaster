package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.service.DisasterCategoryService;
import com.disaster.api.util.page.PageObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "DisasterCategory", description = "재난정보카테고리")
@RequestMapping("/disasterCategory")
public class DisasterCategoryController {

    private final DisasterCategoryService disasterCategoryService;

    public DisasterCategoryController(DisasterCategoryService disasterCategoryService) {
        this.disasterCategoryService = disasterCategoryService;
    }

    @GetMapping("/list.do")
    public String list(HttpServletRequest request, Model model) {
        try {
            PageObject pageObject = PageObject.getInstance(request);

            // API 데이터 수집 호출
            disasterCategoryService.updateDisasterData(10);

            model.addAttribute("pageObject", pageObject);
            model.addAttribute("url", request.getRequestURL());

            return "disasterCategory/list";
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("moduleName", "재난 카테고리");
            model.addAttribute("e", e);
            return "error/err_500";
        }
    }
}