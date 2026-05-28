package com.agri.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SoftDelete(columnName = "is_deleted")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // QUAN TRỌNG: ĐỔI THÀNH EAGER
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(unique = true)
    private String sku;

    @Column(name = "weight_volume", nullable = false)
    private String weightVolume;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "old_price", precision = 12, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "import_price", precision = 12, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "discount_start_date")
    private LocalDateTime discountStartDate;

    @Column(name = "discount_end_date")
    private LocalDateTime discountEndDate;
}