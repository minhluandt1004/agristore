package com.agri.backend.controller;

import com.agri.backend.dto.*;
import com.agri.backend.entity.User;
import com.agri.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    // =======================================
    // API QUẢN TRỊ VIÊN (ADMIN)
    // =======================================
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginData) {
        try {
            String loginId = loginData.get("loginId");
            String password = loginData.get("password");

            if (loginId == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập tài khoản và mật khẩu!"));
            }

            UserResponse response = userService.adminLogin(loginId, password);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Trả về HTTP 400 cùng với lý do lỗi (Sai mật khẩu, Không có quyền, Bị khóa...)
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =======================================
    // API NGƯỜI DÙNG CƠ BẢN
    // =======================================
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody Map<String, String> loginData) {
        return ResponseEntity.ok(userService.login(loginData.get("phone"), loginData.get("password")));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserResponse> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> data) {
        return ResponseEntity.ok(userService.updateProfile(userId, data.get("fullName"), data.get("email")));
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody PasswordRequest request) {
        try {
            userService.changePassword(userId, request);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =======================================
    // API SỔ ĐỊA CHỈ
    // =======================================
    @GetMapping("/{userId}/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getAddresses(userId));
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<AddressResponse> addAddress(@PathVariable Long userId, @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.saveAddress(userId, null, request));
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable Long userId, @PathVariable Long addressId, @RequestBody AddressRequest request) {
        return ResponseEntity.ok(userService.saveAddress(userId, addressId, request));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressId) {
        userService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/addresses/{addressId}/default")
    public ResponseEntity<?> setDefault(@PathVariable Long userId, @PathVariable Long addressId) {
        try {
            userService.setDefaultAddress(userId, addressId);
            return ResponseEntity.ok(Map.of("message", "Đã đặt làm địa chỉ mặc định"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =======================================
    // API VALIDATION
    // =======================================
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // =======================================
    // API GUEST (KHÁCH VÃNG LAI) & MERGE
    // =======================================
    @PostMapping("/guest")
    public ResponseEntity<UserResponse> createOrGetGuest(@RequestBody GuestRequest request) {
        try {
            User guest = userService.createOrGetGuest(
                    request.getPhone(),
                    request.getFullName(),
                    request.getEmail()
            );
            return ResponseEntity.ok(userService.convertToUserResponse(guest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{userId}/merge-from-guest")
    public ResponseEntity<?> mergeFromGuest(@PathVariable Long userId, @RequestParam Long guestUserId) {
        try {
            userService.mergeGuestCartToUser(guestUserId, userId);
            userService.mergeGuestOrders(guestUserId, userId);
            return ResponseEntity.ok(Map.of("message", "Đã gộp giỏ hàng và đơn hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}