package com.agri.backend.service;

import com.agri.backend.dto.DashboardResponse;
import com.agri.backend.entity.Order;
import com.agri.backend.repository.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PostRepository postRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderItemRepository orderItemRepository;

    public DashboardResponse getDashboardSummary() {

        // 1. Lấy Core KPIs
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Long totalOrders = orderRepository.count();
        Long totalProducts = productRepository.count();
        Long totalPosts = postRepository.count();

        // 2. Lấy 5 Đơn hàng mới nhất
        List<Order> recentOrdersList = orderRepository.findTop5ByOrderByCreatedAtDesc();
        List<DashboardResponse.OrderSummary> recentOrders = recentOrdersList.stream()
                .map(o -> DashboardResponse.OrderSummary.builder()
                        .orderCode(o.getOrderCode())
                        .customerName(o.getUser() != null ? o.getUser().getFullName() : o.getShippingAddress().getReceiverName())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus().name())
                        .createdAt(o.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        // 3. Lấy Tồn kho thấp (Sắp hết hàng)
        List<DashboardResponse.LowStockProduct> lowStockProducts = variantRepository.findByStockQuantityLessThanEqual(10)
                .stream()
                .map(v -> DashboardResponse.LowStockProduct.builder()
                        .name(v.getProduct().getName() + " - " + v.getWeightVolume())
                        .sku(v.getSku())
                        .stock(v.getStockQuantity())
                        .build())
                .collect(Collectors.toList());

        // 4. Lấy Top 5 Sản phẩm bán chạy
        List<Object[]> topSellingData = orderItemRepository.getTopSellingProducts(PageRequest.of(0, 5));
        List<DashboardResponse.TopSellingProduct> topSellingProducts = topSellingData.stream()
                .map(row -> DashboardResponse.TopSellingProduct.builder()
                        .name((String) row[0])
                        .soldQuantity((Long) row[1])
                        .revenue((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());

        // 5. Build Final Response
        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalPosts(totalPosts)
                .recentOrders(recentOrders)
                .lowStockProducts(lowStockProducts)
                .topSellingProducts(topSellingProducts)
                // Chart Data tạm thời fix cứng, sau này bạn query group theo DATE(created_at)
                .chartData(DashboardResponse.ChartData.builder()
                        .labels(List.of("T5", "T6", "T7", "T8", "T9", "T10"))
                        .revenueData(List.of(BigDecimal.valueOf(120), BigDecimal.valueOf(150), BigDecimal.valueOf(95), BigDecimal.valueOf(180), BigDecimal.valueOf(210), totalRevenue.divide(BigDecimal.valueOf(1000000))))
                        .build())
                .build();
    }
}