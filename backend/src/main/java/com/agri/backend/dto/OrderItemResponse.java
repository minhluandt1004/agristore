package com.agri.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long variantId;
    private Long productId;
    private String name;
    private String image;
    private String weightVolume;
    private Double unitPrice;
    private Integer quantity;
    private Double totalPrice;
}