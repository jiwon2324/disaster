package com.disaster.api.disaster.controller;

import com.disaster.api.disaster.entity.DisasterCategory;
import com.disaster.api.disaster.service.DisasterCategoryService;
import com.disaster.api.util.page.PageObject;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Tag(name = "DisasterCategory", description = "재난정보카테고리")
@Controller
@RequestMapping("/disasterCategory")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DisasterCategoryController {

    private final DisasterCategoryService disasterCategoryService;

    public DisasterCategoryController(DisasterCategoryService disasterCategoryService) {
        this.disasterCategoryService = disasterCategoryService;
    }

    @Operation(summary = "재난 API 데이터 수집 트리거", description = "공공 API 데이터를 수집하고 화면을 띄웁니다.")
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

    @Operation(summary = "[관리자] 카테고리 목록 관리", description = "DB에 등록된 모든 카테고리 종류를 조회합니다.")
    @GetMapping("/manageList.do")
    public String manageList(Model model) {
        List<DisasterCategory> categoryList = disasterCategoryService.getAllCategories();
        model.addAttribute("categoryList", categoryList);
        return "disasterCategory/manageList";
    }

    @Operation(summary = "[관리자] 카테고리 추가/수정 폼", description = "새로운 카테고리를 추가하거나 기존 카테고리 이름을 수정하는 폼입니다.")
    @GetMapping("/write.do")
    public String writeForm(@RequestParam(value = "catId", required = false) Long catId, Model model) {
        DisasterCategory category = new DisasterCategory();
        if (catId != null) {
            category = disasterCategoryService.getCategory(catId);
        }
        model.addAttribute("category", category);
        return "disasterCategory/write";
    }

    @Operation(summary = "[관리자] 카테고리 저장 처리", description = "입력받은 카테고리 정보를 DB에 저장(Insert 또는 Update)합니다.")
    @PostMapping("/write.do")
    public String write(@ModelAttribute DisasterCategory category, RedirectAttributes rttr) {
        try {
            disasterCategoryService.saveCategory(category);
            rttr.addFlashAttribute("msg", "카테고리가 정상적으로 저장되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("msg", "카테고리 저장에 실패했습니다.");
        }
        return "redirect:/disasterCategory/manageList.do";
    }

    @Operation(summary = "[관리자] 카테고리 삭제 처리", description = "선택한 카테고리를 DB에서 삭제합니다.")
    @PostMapping("/delete.do")
    public String delete(@RequestParam("catId") Long catId, RedirectAttributes rttr) {
        try {
            disasterCategoryService.deleteCategory(catId);
            rttr.addFlashAttribute("msg", "카테고리가 삭제되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            rttr.addFlashAttribute("msg", "삭제 실패: 해당 카테고리를 참조하는 재난 정보가 있을 수 있습니다.");
        }
        return "redirect:/disasterCategory/manageList.do";
    }
}