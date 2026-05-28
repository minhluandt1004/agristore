package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CategoryProductResponse {
    private Long categoryId;
    private String categoryName;
    private String categorySlug;

    // Danh sách sản phẩm thuộc danh mục này
    private List<ProductCardResponse> products;
}