package com.agri.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    // Thông tin Product
    private String name;
    private Long categoryId;
    private Long brandId;
    private String shortDesc;
    private String fullDesc;

    // Thông số kỹ thuật
    private String registrationNumber;
    private String activeIngredients;
    private String formulation;
    private String toxicityClass;
    private Integer phiDays;
    private String targetCrops;
    private String usagePurpose;
    private String usageInstructions;
    private String safetyWarnings;
    private Boolean isPublished = true;
    private String shelfLife;
    private String dosageRate;

    // Danh sách biến thể (Giá, Kho, SKU)
    private List<VariantRequest> variants;

    // Danh sách hình ảnh
    private List<ImageRequest> images;
}