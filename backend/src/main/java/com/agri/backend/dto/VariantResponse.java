package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class VariantResponse {
    private Long id;
    private String sku;
    private String weightVolume;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer stockQuantity;
    private String imageUrl;
}