package com.agri.backend.controller;

import com.agri.backend.dto.CartMergeRequest;
import com.agri.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<?> updateCart(@PathVariable Long userId, @RequestBody Map<String, Object> body) {
        try {
            Long variantId = Long.valueOf(body.get("variantId").toString());
            Integer quantity = Integer.valueOf(body.get("quantity").toString());
            cartService.updateCart(userId, variantId, quantity);
            return ResponseEntity.ok(Map.of("message", "Cập nhật giỏ hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dữ liệu không hợp lệ: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/merge")
    public ResponseEntity<?> mergeCart(@PathVariable Long userId, @RequestBody CartMergeRequest request) {
        try {
            cartService.mergeCart(userId, request);
            return ResponseEntity.ok(Map.of("message", "Hợp nhất giỏ hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/remove/{variantId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long variantId) {
        try {
            cartService.removeFromCart(userId, variantId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/merge-from-guest")
    public ResponseEntity<?> mergeCartFromGuest(@PathVariable Long userId, @RequestParam Long guestUserId) {
        try {
            cartService.mergeCartFromGuest(userId, guestUserId);
            return ResponseEntity.ok(Map.of("message", "Đã merge giỏ hàng từ guest vào user"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}