package com.agri.backend.repository;

import com.agri.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);
    Optional<ProductVariant> findBySku(String sku);

    List<ProductVariant> findByStockQuantityLessThanEqual(Integer threshold);

    @Modifying
    @Query("DELETE FROM ProductVariant v WHERE v.product.id = :productId")
    void deleteByProductId(Long productId);

}