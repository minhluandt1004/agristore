package com.agri.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SoftDelete;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SoftDelete(columnName = "is_deleted")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    // -- Thông số kỹ thuật --
    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "active_ingredients", columnDefinition = "TEXT")
    private String activeIngredients;

    private String formulation;

    @Column(name = "toxicity_class")
    private String toxicityClass;

    @Column(name = "phi_days")
    private Integer phiDays;

    @Column(name = "target_crops", columnDefinition = "TEXT")
    private String targetCrops;

    @Column(name = "usage_purpose", columnDefinition = "TEXT")
    private String usagePurpose;

    @Column(name = "shelf_life")
    private String shelfLife;  // <-- thêm hạn sử dụng

    @Column(name = "dosage_rate")
    private String dosageRate; // <-- thêm tỷ lệ pha

    // -- Mô tả & Hướng dẫn --
    @Column(name = "short_desc", columnDefinition = "TEXT")
    private String shortDesc;

    @Column(name = "full_desc", columnDefinition = "LONGTEXT")
    private String fullDesc;

    @Column(name = "usage_instructions", columnDefinition = "TEXT")
    private String usageInstructions;

    @Column(name = "safety_warnings", columnDefinition = "TEXT")
    private String safetyWarnings;

    // -- Cache đánh giá sao --
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "is_published")
    private Boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "review_video_url")
    private String reviewVideoUrl;

}