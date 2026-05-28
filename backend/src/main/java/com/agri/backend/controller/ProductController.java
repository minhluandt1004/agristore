package com.agri.backend.controller;

import com.agri.backend.dto.CategoryProductResponse;
import com.agri.backend.dto.ProductCardResponse;
import com.agri.backend.dto.ProductDetailResponse;
import com.agri.backend.dto.ProductRequest;
import com.agri.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/home-grouped")
    public ResponseEntity<List<CategoryProductResponse>> getHomePageProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<CategoryProductResponse> groupedProducts = productService.getHomePageProductsGroupedByCategory(limit);
        return ResponseEntity.ok(groupedProducts);
    }

    @GetMapping
    public ResponseEntity<Page<ProductCardResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId) {
        Page<ProductCardResponse> products = productService.getProducts(page, size, categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductCardResponse>> getAllProducts() {
        List<ProductCardResponse> products = productService.getAllProducts();
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

    @GetMapping("/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        try {
            ProductDetailResponse response = productService.getProductDetailBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        try {
            ProductDetailResponse response = productService.createProduct(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi tạo sản phẩm: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        try {
            ProductDetailResponse response = productService.updateProduct(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi cập nhật sản phẩm: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}