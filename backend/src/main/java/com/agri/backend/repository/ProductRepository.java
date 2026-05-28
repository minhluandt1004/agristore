package com.agri.backend.repository;

import com.agri.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlugAndIsPublishedTrue(String slug);
    Page<Product> findByCategoryIdAndIsPublishedTrue(Long categoryId, Pageable pageable);
    // Trong ProductRepository.java
    Page<Product> findByCategoryIdInAndIsPublishedTrue(List<Long> categoryIds, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndIsPublishedTrue(String name, Pageable pageable);
    Page<Product> findByIsPublishedTrue(Pageable pageable);
    Optional<Product> findBySlug(String slug);
    Page<Product> findByNameContainingIgnoreCaseOrSlugContainingIgnoreCaseOrShortDescContainingIgnoreCase(
            String name, String slug, String shortDesc, Pageable pageable);
}