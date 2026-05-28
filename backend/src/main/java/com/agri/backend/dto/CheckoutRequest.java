package com.agri.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private Long userId;
    private Long shippingAddressId;
    private Long paymentMethodId;
    private String note;
    private List<OrderItemRequest> items;

    // Thêm 3 trường để nhận từ frontend
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;

    private Boolean clearCartAfterCheckout;
}