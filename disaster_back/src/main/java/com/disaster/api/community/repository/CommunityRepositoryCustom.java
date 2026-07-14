package com.disaster.api.community.repository;

import com.querydsl.core.Tuple;
import com.disaster.api.community.entity.Community;
import java.util.List;

public interface CommunityRepositoryCustom {
    List<Tuple> getList(Long page, Long perPageNum, String key, String word);
    Long getCount(String key, String word);
    Tuple getCommunity(Long no);
    Long increaseHit(Long no);
    Community writeCommunity(Community community);
    Long updateCommunity(String title, String content, String writer, Long no);
    Long changeImage(Long no, String fileName);
    void deleteCommunity(Long no);
}