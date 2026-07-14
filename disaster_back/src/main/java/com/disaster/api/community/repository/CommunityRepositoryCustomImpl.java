package com.disaster.api.community.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.disaster.api.community.entity.Community;
import com.disaster.api.community.entity.QCommunity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CommunityRepositoryCustomImpl implements CommunityRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    private final QCommunityRepository qCommunityRepository;

    QCommunity community = QCommunity.community;

    @Override
    public List<Tuple> getList(Long page, Long perPageNum, String key, String word) {
        return queryFactory
                .select(
                        community.no,
                        community.title,
                        community.writer,
                        community.hit,
                        community.writeDate,
                        community.fileName
                )
                .from(community)
                .where(search(key, word))
                .orderBy(community.no.desc())
                .limit(perPageNum)
                .offset((page - 1) * perPageNum)
                .fetch();
    }

    private BooleanBuilder search(String key, String word) {
        BooleanBuilder builder = new BooleanBuilder();
        if (word == null || word.trim().isEmpty()) return builder;

        if (key.contains("t")) builder.or(community.title.contains(word));
        if (key.contains("c")) builder.or(community.content.contains(word));
        if (key.contains("w")) builder.or(community.writer.contains(word));
        return builder;
    }

    @Override
    public Long getCount(String key, String word) {
        return queryFactory
                .select(community.count())
                .from(community)
                .where(search(key, word))
                .fetchOne();
    }

    @Override
    public Tuple getCommunity(Long no) {
        return queryFactory
                .select(
                        community.no,
                        community.title,
                        community.content,
                        community.writer,
                        community.writeDate,
                        community.hit,
                        community.fileName
                )
                .from(community)
                .where(community.no.eq(no))
                .fetchOne();
    }

    @Override
    public Long increaseHit(Long no) {
        return queryFactory
                .update(community)
                .set(community.hit, community.hit.add(1))
                .where(community.no.eq(no))
                .execute();
    }

    @Override
    public Community writeCommunity(Community communityData) {
        return qCommunityRepository.save(communityData);
    }

    @Override
    public Long updateCommunity(String title, String content, String writer, Long no) {
        return queryFactory
                .update(community)
                .set(community.title, title)
                .set(community.content, content)
                .set(community.writer, writer)
                .where(community.no.eq(no))
                .execute();
    }

    @Override
    public Long changeImage(Long no, String fileName) {
        return queryFactory
                .update(community)
                .set(community.fileName, fileName)
                .where(community.no.eq(no))
                .execute();
    }

    @Override
    public void deleteCommunity(Long no) {
        qCommunityRepository.deleteById(no);
    }
}