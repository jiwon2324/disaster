package com.disaster.api.image.repository;

import com.disaster.api.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QImageRepository
extends JpaRepository<Image, Long>, QuerydslPredicateExecutor<Image> {
}
