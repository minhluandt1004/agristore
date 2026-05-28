package com.agri.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class VariantRequest {
    private String sku;
    private String weightVolume;
    private BigDecimal importPrice;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer stockQuantity;
}