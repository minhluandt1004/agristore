package com.agri.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long orderId;
    private String orderCode;

    private Long userId;

    private Long shippingAddressId;
    private String shippingAddress;

    // THÊM 2 DÒNG NÀY
    private String receiverName;
    private String receiverPhone;

    private Long paymentMethodId;
    private String paymentMethodName;

    private Double subtotal;
    private Double shippingFee;
    private Double totalAmount;

    private String paymentStatus;
    private String orderStatus;

    private String note;

    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}