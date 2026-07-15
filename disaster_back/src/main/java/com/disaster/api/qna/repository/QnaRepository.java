package com.disaster.api.qna.repository;

import com.disaster.api.qna.entity.Qna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface QnaRepository
        extends JpaRepository<Qna, Long>, JpaSpecificationExecutor<Qna> {

    List<Qna> findAllByRefNoOrderByOrdNoAsc(Long refNo);

    boolean existsByParentNo(Long parentNo);

    List<Qna> findAllByParentNo(Long parentNo);
}
