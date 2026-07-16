package com.disaster.api.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Log4j2
public class CustomExceptionHandler {

    /**
     * 서비스에서 지정한 400, 401, 403, 404 등의 상태 코드를
     * 그대로 클라이언트에 전달한다.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>>
    handleResponseStatusException(
            ResponseStatusException e,
            HttpServletRequest request
    ) {
        int statusCode = e.getStatusCode().value();

        String message = e.getReason() == null
                ? "요청 처리 중 오류가 발생했습니다."
                : e.getReason();

        log.warn(
                "[ResponseStatusException] uri={}, status={}, message={}",
                request.getRequestURI(),
                statusCode,
                message
        );

        Map<String, String> response = new LinkedHashMap<>();

        response.put("code", String.valueOf(statusCode));
        response.put(
                "error type",
                e.getStatusCode().toString()
        );
        response.put("message", message);

        return ResponseEntity
                .status(e.getStatusCode())
                .body(response);
    }

    /**
     * 별도로 상태 코드가 지정되지 않은 예상하지 못한 오류만
     * 500 Internal Server Error로 처리한다.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>>
    handleRuntimeException(
            RuntimeException e,
            HttpServletRequest request
    ) {
        log.error(
                "[RuntimeException] uri={}, message={}",
                request.getRequestURI(),
                e.getMessage(),
                e
        );

        String message = e.getMessage() == null
                ? "서버 내부 오류가 발생했습니다."
                : e.getMessage();

        Map<String, String> response = new LinkedHashMap<>();

        response.put(
                "code",
                String.valueOf(
                        HttpStatus.INTERNAL_SERVER_ERROR.value()
                )
        );
        response.put(
                "error type",
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase()
        );
        response.put("message", message);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}