package com.agri.backend.controller;

import com.agri.backend.entity.Brand;
import com.agri.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@CrossOrigin("*") // Bắt buộc để React gọi được
public class BrandController {

    // Đổi từ BrandRepository sang BrandService
    private final BrandService brandService;

    // API Lấy toàn bộ danh sách Brand
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        // Gọi dữ liệu thông qua Service
        return ResponseEntity.ok(brandService.getAllBrands());
    }
}