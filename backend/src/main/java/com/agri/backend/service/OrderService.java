package com.agri.backend.service;

import com.agri.backend.constants.OrderStatus;
import com.agri.backend.constants.PaymentStatus;
import com.agri.backend.dto.CheckoutRequest;
import com.agri.backend.dto.OrderItemRequest;
import com.agri.backend.entity.*;
import com.agri.backend.repository.*;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartItemRepository cartItemRepository,
                        PaymentMethodRepository paymentMethodRepository,
                        UserAddressRepository userAddressRepository,
                        ProductVariantRepository variantRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.userAddressRepository = userAddressRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(CheckoutRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty())
            throw new RuntimeException("Không có sản phẩm để đặt hàng");

        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("User not found"));
        UserAddress shippingAddress = userAddressRepository.findById(request.getShippingAddressId()).orElseThrow();
        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId()).orElseThrow();

        BigDecimal subtotal = request.getSubtotal();
        BigDecimal shippingFee = request.getShippingFee();
        BigDecimal totalAmount = request.getTotalAmount();

        Order order = Order.builder()
                .user(user)
                .orderCode("ORD" + System.currentTimeMillis())
                .shippingAddress(shippingAddress)
                .paymentMethod(paymentMethod)
                .note(request.getNote())
                .paymentStatus(PaymentStatus.UNPAID)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .items(new ArrayList<>())
                .build();

        orderRepository.save(order);

        for (OrderItemRequest item : request.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId()).orElseThrow();
            if (variant.getStockQuantity() < item.getQuantity())
                throw new RuntimeException("Sản phẩm không đủ kho");

            BigDecimal totalPrice = variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .quantity(item.getQuantity())
                    .unitPrice(variant.getPrice())
                    .totalPrice(totalPrice)
                    .build();
            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            variantRepository.save(variant);
        }

        // 🔥 FIX LỖI NO SESSION CHO LUỒNG TẠO ĐƠN
        Hibernate.initialize(order.getItems());
        order.getItems().forEach(i -> {
            Hibernate.initialize(i.getVariant());
            Hibernate.initialize(i.getVariant().getProduct());
            Hibernate.initialize(i.getVariant().getProduct().getImages());
        });
        Hibernate.initialize(order.getPaymentMethod());
        Hibernate.initialize(order.getShippingAddress());
        Hibernate.initialize(order.getUser());

        if (Boolean.TRUE.equals(request.getClearCartAfterCheckout())) {
            cartItemRepository.deleteAllByUserId(user.getId());
        }

        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể thay đổi trạng thái!");
        }
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Đơn hàng đã hoàn thành, không thể thay đổi trạng thái!");
        }

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.CANCELLED) {
            order.getItems().forEach(item -> {
                ProductVariant variant = item.getVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                variantRepository.save(variant);
            });
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }

        // 🔥 FIX LỖI NO SESSION CHO LUỒNG ADMIN CẬP NHẬT TRẠNG THÁI
        Hibernate.initialize(order.getItems());
        order.getItems().forEach(item -> {
            Hibernate.initialize(item.getVariant());
            Hibernate.initialize(item.getVariant().getProduct());
            Hibernate.initialize(item.getVariant().getProduct().getImages());
        });
        Hibernate.initialize(order.getPaymentMethod());
        Hibernate.initialize(order.getShippingAddress());
        Hibernate.initialize(order.getUser());

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> findAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(order -> {
            Hibernate.initialize(order.getItems());
            order.getItems().forEach(item -> {
                Hibernate.initialize(item.getVariant());
                Hibernate.initialize(item.getVariant().getProduct());
                Hibernate.initialize(item.getVariant().getProduct().getImages());
            });
            Hibernate.initialize(order.getPaymentMethod());
            Hibernate.initialize(order.getShippingAddress());
            Hibernate.initialize(order.getUser()); // 🔥 THÊM CHO LUỒNG LẤY TẤT CẢ ĐƠN ADMIN
        });
        return orders;
    }

    @Transactional
    public Order updatePaymentStatus(Long orderId, boolean success) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        if (success) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.PROCESSING);
        } else {
            order.setPaymentStatus(PaymentStatus.UNPAID);
            order.setStatus(OrderStatus.CANCELLED);
        }

        // 🔥 FIX LỖI NO SESSION CHO LUỒNG CẬP NHẬT THANH TOÁN (WEBHOOK/VNPAY CALLBACK)
        Hibernate.initialize(order.getItems());
        order.getItems().forEach(item -> {
            Hibernate.initialize(item.getVariant());
            Hibernate.initialize(item.getVariant().getProduct());
            Hibernate.initialize(item.getVariant().getProduct().getImages());
        });
        Hibernate.initialize(order.getPaymentMethod());
        Hibernate.initialize(order.getShippingAddress());
        Hibernate.initialize(order.getUser());

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        orders.forEach(order -> {
            Hibernate.initialize(order.getItems());

            order.getItems().forEach(item -> {
                Hibernate.initialize(item.getVariant());
                Hibernate.initialize(item.getVariant().getProduct());
                Hibernate.initialize(item.getVariant().getProduct().getImages());
            });

            Hibernate.initialize(order.getPaymentMethod());
            Hibernate.initialize(order.getShippingAddress());
            Hibernate.initialize(order.getUser()); // 🔥 THÊM CHO LUỒNG LẤY ĐƠN HÀNG LỊCH SỬ CỦA USER
        });

        return orders;
    }

    @Transactional
    public void mergeGuestOrders(Long targetUserId, Long guestUserId) {
        List<Order> guestOrders = orderRepository.findByUserIdAndPaymentStatus(guestUserId, PaymentStatus.UNPAID);
        User targetUser = userRepository.findById(targetUserId).orElseThrow();

        for (Order guestOrder : guestOrders) {
            guestOrder.setUser(targetUser);
            orderRepository.save(guestOrder);
        }
    }
}