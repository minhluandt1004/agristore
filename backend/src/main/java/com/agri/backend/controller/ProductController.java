package com.agri.backend.controller;

import com.agri.backend.dto.CategoryProductResponse;
import com.agri.backend.dto.ProductCardResponse;
import com.agri.backend.dto.ProductDetailResponse;
import com.agri.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/home-grouped")
    public ResponseEntity<List<CategoryProductResponse>> getHomePageProducts(
            @RequestParam(defaultValue = "8") int limit) {

        List<CategoryProductResponse> groupedProducts =
                productService.getHomePageProductsGroupedByCategory(limit);

        return ResponseEntity.ok(groupedProducts);
    }

    @GetMapping
    public ResponseEntity<Page<ProductCardResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId) {

        Page<ProductCardResponse> products =
                productService.getProducts(page, size, categoryId);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductCardResponse>> getAllProducts() {

        List<ProductCardResponse> products =
                productService.getAllProducts();

        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductCardResponse>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        List<ProductCardResponse> results = productService.searchProducts(query, pageable);
        return ResponseEntity.ok(results);
    }

    // ---> BẠN THÊM API NÀY VÀO PRODUCT CONTROLLER <---
    @GetMapping("/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        try {
            // Gọi Service để lấy Full Data
            ProductDetailResponse response = productService.getProductDetailBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Trả về lỗi 404 Not Found nếu slug không tồn tại
            return ResponseEntity.notFound().build();
        }
    }
}