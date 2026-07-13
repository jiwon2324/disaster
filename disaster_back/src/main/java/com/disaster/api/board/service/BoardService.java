package com.disaster.api.board.service;

import com.disaster.api.board.vo.BoardVO;
import com.disaster.api.util.page.PageObject;

import java.util.List;

public interface BoardService {

    // 1. list
    List<BoardVO> list(PageObject pageObject);
    // 2. view
    BoardVO view(Long no, Integer inc);
    // 3. write
    BoardVO write(BoardVO vo);
    // 4. update
    Long update(BoardVO vo);
    // 5. delete
    Long delete(BoardVO vo);

}
