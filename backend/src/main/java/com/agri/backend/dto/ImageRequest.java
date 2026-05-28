package com.agri.backend.dto;

import lombok.Data;

@Data
public class ImageRequest {
    private String imageUrl;
    private Boolean isPrimary = false;
    private String sku; // Để biết ảnh này thuộc biến thể nào
}