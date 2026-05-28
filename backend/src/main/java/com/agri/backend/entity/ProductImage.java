package com.agri.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

@Entity
@Table(name = "product_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SoftDelete(columnName = "is_deleted")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;
}