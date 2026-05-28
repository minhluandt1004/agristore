package com.agri.backend.controller;

import com.agri.backend.dto.DashboardResponse;
import com.agri.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}