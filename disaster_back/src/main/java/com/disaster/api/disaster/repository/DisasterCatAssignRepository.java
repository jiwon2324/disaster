package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterCatAssign;
import com.disaster.api.disaster.entity.DisasterCatAssignId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface DisasterCatAssignRepository extends JpaRepository<DisasterCatAssign, DisasterCatAssignId> {
    @Transactional
    void deleteByNo(Long no);
}