package com.disaster.api.community.service;

import com.disaster.api.community.vo.CommunityVO;
import com.disaster.api.util.page.PageObject;
import java.util.List;

public interface CommunityService {
    List<CommunityVO> list(PageObject pageObject);
    CommunityVO view(Long no, Integer inc);
    CommunityVO write(CommunityVO vo);
    Long update(CommunityVO vo);
    String delete(CommunityVO vo);
    Long changeImage(CommunityVO vo);
}