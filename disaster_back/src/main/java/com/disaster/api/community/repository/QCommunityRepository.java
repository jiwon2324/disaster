package com.disaster.api.community.repository;

import com.disaster.api.community.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QCommunityRepository
        extends JpaRepository<Community, Long>, QuerydslPredicateExecutor<Community> {
}
