package com.agri.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartMergeRequest {
    private List<LocalItem> items;

    @Data
    public static class LocalItem {
        private Long variantId;
        private Integer quantity;
    }
}