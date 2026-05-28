package com.agri.backend.repository;

import com.agri.backend.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    @Query("SELECT i.variant.product.name, SUM(i.quantity), SUM(i.totalPrice) " +
            "FROM OrderItem i " +
            "GROUP BY i.variant.product.id, i.variant.product.name " +
            "ORDER BY SUM(i.quantity) DESC")
    List<Object[]> getTopSellingProducts(Pageable pageable);
}