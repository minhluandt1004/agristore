package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartItemResponse {
    private Long variantId;
    private Long productId;
    private String name;
    private String image;
    private String weightVolume;
    private Double price;
    private Integer quantity;
}