package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String slug;

    // -- Brand & Category --
    private String brandName;
    private String categoryName;
    private String categorySlug;

    // -- Price & Rating --
    private BigDecimal minPrice;
    private BigDecimal minOldPrice;
    private BigDecimal averageRating;
    private Integer reviewCount;

    // -- Images & Video --
    private List<String> images; // Lấy toàn bộ mảng ảnh
    private String reviewVideoUrl;

    // -- Descriptions --
    private String shortDesc;
    private String fullDesc;
    private String usageInstructions;
    private String safetyWarnings;

    // -- Specs (Thông số kỹ thuật) --
    private String registrationNumber;
    private String activeIngredients;
    private String formulation;
    private String toxicityClass;
    private Integer phiDays;
    private String targetCrops;
    private String usagePurpose;
    private List<VariantResponse> variants; 
}