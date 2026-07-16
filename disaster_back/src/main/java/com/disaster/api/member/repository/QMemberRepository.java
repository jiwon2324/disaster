package com.disaster.api.member.repository;

import com.disaster.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QMemberRepository
        extends JpaRepository<Member, String>,
        QuerydslPredicateExecutor<Member>,
        JpaSpecificationExecutor<Member> {
}