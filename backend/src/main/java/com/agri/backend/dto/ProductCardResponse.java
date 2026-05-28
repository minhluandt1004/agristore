package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductCardResponse {

    private Long id;

    private String name;

    private String slug;

    private String shortDescription;

    private String categoryName;

    private String categorySlug;

    // Thêm trường brandName vào đây để sửa lỗi
    private String brandName;

    private String primaryImageUrl;

    private BigDecimal minPrice;

    private BigDecimal minOldPrice;

    private BigDecimal averageRating;

    private Integer reviewCount;

}