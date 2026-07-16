package com.disaster.api.disaster.repository; // 본인 프로젝트 패키지 경로에 맞게 수정

import com.disaster.api.disaster.entity.DisasterInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisasterInfoRepository extends JpaRepository<DisasterInfo, Long> {
    // JpaRepository를 상속받으면 save(), findById() 등을 자동으로 사용할 수 있습니다.
}