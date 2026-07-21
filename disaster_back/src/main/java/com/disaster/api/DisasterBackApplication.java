package com.disaster.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 스케줄러 활성화 어노테이션
@SpringBootApplication
public class DisasterBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(DisasterBackApplication.class, args);
    }

}
