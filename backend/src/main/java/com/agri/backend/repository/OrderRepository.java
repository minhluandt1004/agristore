package com.agri.backend.repository;

import com.agri.backend.constants.PaymentStatus;
import com.agri.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    List<Order> findByUserIdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}