package com.agri.backend.controller;

import com.agri.backend.constants.OrderStatus;
import com.agri.backend.dto.CheckoutRequest;
import com.agri.backend.dto.OrderItemResponse;
import com.agri.backend.dto.OrderResponse;
import com.agri.backend.entity.Order;
import com.agri.backend.entity.OrderItem;
import com.agri.backend.entity.ProductVariant;
import com.agri.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestBody CheckoutRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.ok(mapToResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{orderId}/payment")
    public ResponseEntity<OrderResponse> updatePayment(@PathVariable Long orderId, @RequestParam boolean success) {
        try {
            Order order = orderService.updatePaymentStatus(orderId, success);
            return ResponseEntity.ok(mapToResponse(order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{userId}/merge-orders-from-guest")
    public ResponseEntity<?> mergeOrdersFromGuest(@PathVariable Long userId, @RequestParam Long guestUserId) {
        try {
            orderService.mergeGuestOrders(userId, guestUserId);
            return ResponseEntity.ok(Map.of("message", "Đã merge đơn hàng từ guest vào user"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getOrdersByUser(userId);

            List<OrderResponse> response = orders.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long orderId,
            @RequestParam String status) { // Nhận string từ frontend
        // Chuyển đổi string sang Enum
        OrderStatus orderStatus = OrderStatus.valueOf(status);
        Order order = orderService.updateOrderStatus(orderId, orderStatus);
        return ResponseEntity.ok(mapToResponse(order));
    }

    // Thêm hàm này để Admin lấy danh sách tất cả đơn hàng
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<Order> orders = orderService.findAllOrders(); // Bạn cần viết hàm này ở Service
        List<OrderResponse> response = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> {
                    ProductVariant variant = i.getVariant();

                    String image = variant.getProduct().getImages()
                            .stream()
                            // Lấy ảnh đầu tiên đúng variant_id
                            .filter(img ->
                                    img.getVariant() != null
                                            && img.getVariant().getId().equals(variant.getId())
                            )
                            .map(img -> img.getImageUrl())
                            .findFirst()

                            // Nếu variant không có ảnh riêng thì lấy ảnh primary của product
                            .orElseGet(() -> variant.getProduct().getImages()
                                    .stream()
                                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                                    .map(img -> img.getImageUrl())
                                    .findFirst()

                                    // Nếu không có ảnh primary thì lấy ảnh đầu tiên của product
                                    .orElseGet(() -> variant.getProduct().getImages()
                                            .stream()
                                            .map(img -> img.getImageUrl())
                                            .findFirst()
                                            .orElse("")
                                    )
                            );

                    return OrderItemResponse.builder()
                            .variantId(variant.getId())
                            .productId(variant.getProduct().getId())
                            .name(variant.getProduct().getName())
                            .image(image)
                            .weightVolume(variant.getWeightVolume())
                            .unitPrice(i.getUnitPrice().doubleValue())
                            .quantity(i.getQuantity())
                            .totalPrice(i.getTotalPrice().doubleValue())
                            .build();
                })
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .shippingAddressId(order.getShippingAddress().getId())
                .shippingAddress(order.getShippingAddress().getFullAddress())
                .receiverName(order.getShippingAddress().getReceiverName())
                .receiverPhone(order.getShippingAddress().getReceiverPhone())
                .paymentMethodId(order.getPaymentMethod().getId())
                .paymentMethodName(order.getPaymentMethod().getName())
                .subtotal(order.getSubtotal().doubleValue())
                .shippingFee(order.getShippingFee().doubleValue())
                .totalAmount(order.getTotalAmount().doubleValue())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getStatus().name())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}