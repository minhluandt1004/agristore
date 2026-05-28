package com.agri.backend.repository;

import com.agri.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductId(Long productId);
    List<ProductImage> findByVariantId(Long variantId);
    @Modifying // Bắt buộc phải có để Spring biết đây là lệnh thay đổi DB
    @Query("DELETE FROM ProductImage p WHERE p.product.id = :productId")
    void deleteByProductId(Long productId);
}