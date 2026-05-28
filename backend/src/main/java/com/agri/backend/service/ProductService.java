package com.agri.backend.service;

import com.agri.backend.dto.CategoryProductResponse;
import com.agri.backend.dto.ProductCardResponse;
import com.agri.backend.dto.ProductDetailResponse;
import com.agri.backend.dto.VariantResponse;
import com.agri.backend.entity.Category;
import com.agri.backend.entity.Product;
import com.agri.backend.entity.ProductImage;
import com.agri.backend.entity.ProductVariant;
import com.agri.backend.repository.CategoryRepository;
import com.agri.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<CategoryProductResponse> getHomePageProductsGroupedByCategory(int limitPerCategory) {
        List<Category> rootCategories = categoryRepository.findByParentIdIsNull();

        return rootCategories.stream()
                .map(category -> {
                    Pageable pageable = PageRequest.of(0, limitPerCategory, Sort.by("createdAt").descending());
                    Page<Product> productPage = productRepository.findByCategoryIdAndIsPublishedTrue(category.getId(), pageable);
                    List<ProductCardResponse> productCards = productPage.getContent().stream()
                            .map(this::mapToCardResponse).collect(Collectors.toList());

                    return CategoryProductResponse.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .categorySlug(category.getSlug())
                            .products(productCards)
                            .build();
                })
                .filter(response -> !response.getProducts().isEmpty())
                .collect(Collectors.toList());
    }

    public Page<ProductCardResponse> getProducts(int page, int size, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;

        if (categoryId != null) {
            productPage = productRepository.findByCategoryIdAndIsPublishedTrue(categoryId, pageable);
        } else {
            productPage = productRepository.findByIsPublishedTrue(pageable);
        }
        return productPage.map(this::mapToCardResponse);
    }

    public List<ProductCardResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::mapToCardResponse).collect(Collectors.toList());
    }

    private ProductCardResponse mapToCardResponse(Product product) {
        String imageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary).map(ProductImage::getImageUrl).findFirst()
                .orElse(product.getImages().isEmpty() ? "default-image.jpg" : product.getImages().get(0).getImageUrl());

        BigDecimal minPrice = product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal oldPrice = product.getVariants().stream().filter(v -> v.getPrice().compareTo(minPrice) == 0)
                .map(ProductVariant::getOldPrice).findFirst().orElse(null);

        return ProductCardResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDesc())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .primaryImageUrl(imageUrl)
                .minPrice(minPrice)
                .minOldPrice(oldPrice)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .build();
    }

    // ==========================================
    // HÀM LẤY CHI TIẾT SẢN PHẨM ĐÃ ĐƯỢC FIX CHUẨN
    // ==========================================
    public ProductDetailResponse getProductDetailBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với slug: " + slug));

        // 1. Lấy mảng URL ảnh chung
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl).collect(Collectors.toList());

        if (imageUrls.isEmpty()) {
            imageUrls.add("https://placehold.co/600x600/e2e8f0/64748b?text=No+Image");
        }

        // 2. Lấy mảng Variants kèm Ảnh riêng của Variant
        List<VariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> {
                    String variantImageUrl = product.getImages().stream()
                            .filter(img -> img.getVariant() != null && img.getVariant().getId().equals(v.getId()))
                            .map(ProductImage::getImageUrl).findFirst().orElse(null);

                    return VariantResponse.builder()
                            .id(v.getId())
                            .sku(v.getSku())
                            .weightVolume(v.getWeightVolume())
                            .price(v.getPrice())
                            .oldPrice(v.getOldPrice())
                            .stockQuantity(v.getStockQuantity())
                            .imageUrl(variantImageUrl) // Gắn ảnh tìm được vào đây
                            .build();
                }).collect(Collectors.toList());

        // 3. Tính Giá Thấp Nhất (Min Price)
        BigDecimal minPrice = product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        // 4. Tính Giá Cũ (Old Price)
        BigDecimal oldPrice = product.getVariants().stream().filter(v -> v.getPrice().compareTo(minPrice) == 0)
                .map(ProductVariant::getOldPrice).findFirst().orElse(null);

        // 5. Map toàn bộ sang DTO trả về
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brandName(product.getBrand() != null ? product.getBrand().getName() : "Agri Store")
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .minPrice(minPrice)
                .minOldPrice(oldPrice)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .images(imageUrls)
                .reviewVideoUrl(product.getReviewVideoUrl())
                .shortDesc(product.getShortDesc())
                .fullDesc(product.getFullDesc())
                .usageInstructions(product.getUsageInstructions())
                .safetyWarnings(product.getSafetyWarnings())
                .registrationNumber(product.getRegistrationNumber())
                .activeIngredients(product.getActiveIngredients())
                .formulation(product.getFormulation())
                .toxicityClass(product.getToxicityClass())
                .phiDays(product.getPhiDays())
                .targetCrops(product.getTargetCrops())
                .usagePurpose(product.getUsagePurpose())
                .variants(variantResponses) // Chèn mảng Variants vào đây
                .build();
    }

    public List<ProductCardResponse> searchProducts(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String searchTerm = query.trim();

        // Tìm kiếm theo tên sản phẩm (ưu tiên), slug, hoặc short description
        Page<Product> productPage = productRepository.findByNameContainingIgnoreCaseOrSlugContainingIgnoreCaseOrShortDescContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm, pageable);

        return productPage.getContent().stream()
                .map(this::mapToCardResponse)
                .collect(Collectors.toList());
    }
}