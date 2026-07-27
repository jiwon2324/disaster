package com.disaster.api.community.controller;

import com.disaster.api.community.service.CommunityService;
import com.disaster.api.community.vo.CommunityVO;
import com.disaster.api.util.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/community")
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityRestController {

    private final CommunityService service;
    private final String savePath = "c:/upload/image/";

    @GetMapping("/list.do")
    public ResponseEntity<Map<String, Object>> list(HttpServletRequest request) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);
        Map<String, Object> map = new HashMap<>();
        map.put("list", service.list(pageObject));
        map.put("pageObject", pageObject);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping("/view.do")
    public ResponseEntity<CommunityVO> view(Long no, Integer inc) {
        return ResponseEntity.status(HttpStatus.OK).body(service.view(no, inc));
    }

    @PostMapping(value = "/write.do", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> write(@RequestPart CommunityVO vo, @RequestPart MultipartFile imageFile) throws IOException {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new RuntimeException("제보 게시판은 이미지가 필수항목입니다.");
        }

        // 3. 파일명 생성 (UUID 활용)
        String originalFilename = imageFile.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String savedFilename = UUID.randomUUID().toString() + extension;

        // 4. 업로드 폴더 자동 생성 및 파일 저장 처리
        Path filePath = Paths.get(savePath, savedFilename);
        Files.createDirectories(filePath.getParent()); // 지정된 경로에 폴더가 없으면 자동으로 생성해 줍니다.
        imageFile.transferTo(filePath.toFile());

        // 5. VO에 파일명 세팅 후 DB 저장
        vo.setFileName(savedFilename);
        service.write(vo);

        return ResponseEntity.status(HttpStatus.OK).body("제보글 등록이 정상 처리되었습니다.");
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody CommunityVO vo) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK).body("제보글 수정이 정상 처리되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(@RequestBody CommunityVO vo) {
        String deletedFileName = service.delete(vo);

        if (deletedFileName != null) {
            File file = new File(savePath + deletedFileName);
            if (file.exists()) file.delete();
        }
        return ResponseEntity.status(HttpStatus.OK).body("제보글 및 첨부 파일이 성공적으로 삭제되었습니다.");
    }

    @PostMapping("/changeImage.do")
    public ResponseEntity<String> changeImage(Long no, MultipartFile changeImage) throws IOException {
        String originalFilename = changeImage.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String savedFilename = UUID.randomUUID().toString() + extension;

        Path filePath = Paths.get(savePath, savedFilename);
        changeImage.transferTo(filePath.toFile());

        CommunityVO vo = new CommunityVO();
        vo.setNo(no);
        vo.setFileName(savedFilename);
        service.changeImage(vo);

        return ResponseEntity.status(HttpStatus.OK).body("제보 이미지 교체가 성공적으로 처리되었습니다.");
    }
}