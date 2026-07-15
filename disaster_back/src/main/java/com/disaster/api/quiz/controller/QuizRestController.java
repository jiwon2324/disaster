package com.disaster.api.quiz.controller;

import com.disaster.api.quiz.service.QuizService;
import com.disaster.api.quiz.vo.QuizVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class QuizRestController {

    private final QuizService service;

    @GetMapping("/list.do")
    public ResponseEntity<List<QuizVO>> list() {
        return ResponseEntity.status(HttpStatus.OK).body(service.list());
    }

    @GetMapping("/view.do")
    public ResponseEntity<QuizVO> view(Long no, Integer inc) {
        return ResponseEntity.status(HttpStatus.OK).body(service.view(no, inc));
    }

    @PostMapping("/write.do")
    public ResponseEntity<String> write(@RequestBody QuizVO vo) {
        service.write(vo);
        return ResponseEntity.status(HttpStatus.OK).body("퀴즈 및 상세 해설 등록이 완료되었습니다.");
    }

    @PostMapping("/update.do")
    public ResponseEntity<String> update(@RequestBody QuizVO vo) {
        service.update(vo);
        return ResponseEntity.status(HttpStatus.OK).body("퀴즈 및 상세 해설 수정이 완료되었습니다.");
    }

    @PostMapping("/delete.do")
    public ResponseEntity<String> delete(Long no) {
        service.delete(no);
        return ResponseEntity.status(HttpStatus.OK).body("퀴즈 및 연관 해설 정보가 완전히 삭제되었습니다.");
    }
}