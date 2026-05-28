package com.agri.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Ưu tiên bắt các lỗi RuntimeException do bạn chủ động throw (Mật khẩu sai, trùng SĐT...)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());

        // Log ra console để bạn dễ debug
        System.err.println("🔥 RUNTIME ERROR: " + ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST) // Trả về 400
                .body(response);
    }

    // Bắt các lỗi hệ thống còn lại (Lỗi SQL, NullPointer...)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Lỗi hệ thống: " + ex.getMessage());
        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR) // Trả về 500
                .body(response);
    }
}