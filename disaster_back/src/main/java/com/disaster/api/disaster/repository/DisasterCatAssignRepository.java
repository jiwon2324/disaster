package com.disaster.api.disaster.repository;

import com.disaster.api.disaster.entity.DisasterCatAssign;
import com.disaster.api.disaster.entity.DisasterCatAssignId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisasterCatAssignRepository extends JpaRepository<DisasterCatAssign, DisasterCatAssignId> {
    // 필요한 경우 복합키를 이용한 쿼리 작성 가능
}