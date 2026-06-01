package com.rdd.dashboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 서버 상태를 확인하기 위한 헬스 체크 컨트롤러
 */
@Tag(name = "Health API", description = "서버 상태 확인 API")
@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    /**
     * 서버가 정상적으로 구동 중인지 확인한다.
     * @return "OK"
     */
    @Operation(summary = "서버 상태 확인", description = "서버가 정상적으로 작동 중일 경우 'OK' 문자열을 반환합니다.")
    @GetMapping
    public String healthCheck() {
        return "OK";
    }
}
