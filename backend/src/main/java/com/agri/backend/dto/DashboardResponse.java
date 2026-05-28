package com.agri.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    // 1. Core KPIs
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalPosts;

    // 2. Lists
    private List<OrderSummary> recentOrders;
    private List<LowStockProduct> lowStockProducts;
    private List<TopSellingProduct> topSellingProducts;

    // 3. Chart Data (Tạm mô phỏng cấu trúc, bạn có thể group theo ngày ở DB sau)
    private ChartData chartData;

    @Data
    @Builder
    public static class OrderSummary {
        private String orderCode;
        private String customerName;
        private BigDecimal totalAmount;
        private String status;
        private String createdAt;
    }

    @Data
    @Builder
    public static class LowStockProduct {
        private String name;
        private String sku;
        private Integer stock;
    }

    @Data
    @Builder
    public static class TopSellingProduct {
        private String name;
        private Long soldQuantity;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    public static class ChartData {
        private List<String> labels;
        private List<BigDecimal> revenueData;
    }
}