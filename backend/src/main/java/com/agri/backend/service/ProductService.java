package com.agri.backend.service;

import com.agri.backend.dto.*;
import com.agri.backend.entity.*;
import com.agri.backend.repository.*;
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
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository productImageRepository;

    // ==========================================
    // CÁC HÀM GET & SEARCH (READ)
    // ==========================================

    public List<CategoryProductResponse> getHomePageProductsGroupedByCategory(int limitPerCategory) {
        List<Category> rootCategories = categoryRepository.findByParentIdIsNull();

        return rootCategories.stream()
                .map(root -> {
                    List<Category> children = categoryRepository.findByParentId(root.getId());

                    List<Long> allCategoryIds = new ArrayList<>();
                    allCategoryIds.add(root.getId());
                    allCategoryIds.addAll(children.stream().map(Category::getId).collect(Collectors.toList()));

                    Pageable pageable = PageRequest.of(0, limitPerCategory, Sort.by("createdAt").descending());
                    Page<Product> productPage = productRepository.findByCategoryIdInAndIsPublishedTrue(allCategoryIds, pageable);

                    List<ProductCardResponse> productCards = productPage.getContent().stream()
                            .map(this::mapToCardResponse)
                            .collect(Collectors.toList());

                    return CategoryProductResponse.builder()
                            .categoryId(root.getId())
                            .categoryName(root.getName())
                            .categorySlug(root.getSlug())
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

    public ProductDetailResponse getProductDetailBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm: " + slug));
        return mapToDetailResponse(product);
    }

    public List<ProductCardResponse> searchProducts(String query, Pageable pageable) {
        if (query == null || query.trim().isEmpty()) return new ArrayList<>();
        Page<Product> productPage = productRepository.findByNameContainingIgnoreCaseOrSlugContainingIgnoreCaseOrShortDescContainingIgnoreCase(
                query.trim(), query.trim(), query.trim(), pageable);
        return productPage.getContent().stream().map(this::mapToCardResponse).collect(Collectors.toList());
    }

    // ==========================================
    // HÀM TẠO SẢN PHẨM MỚI (WRITE)
    // ==========================================
    @Transactional
    public ProductDetailResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand không tồn tại"));

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getName().toLowerCase().replaceAll("\\s+", "-") + "-" + System.currentTimeMillis())
                .category(category)
                .brand(brand)
                .shortDesc(request.getShortDesc())
                .fullDesc(request.getFullDesc())
                .registrationNumber(request.getRegistrationNumber())
                .activeIngredients(request.getActiveIngredients())
                .formulation(request.getFormulation())
                .toxicityClass(request.getToxicityClass())
                .phiDays(request.getPhiDays())
                .targetCrops(request.getTargetCrops())
                .usagePurpose(request.getUsagePurpose())
                .usageInstructions(request.getUsageInstructions())
                .safetyWarnings(request.getSafetyWarnings())
                .shelfLife(request.getShelfLife())
                .dosageRate(request.getDosageRate())
                .isPublished(request.getIsPublished())
                .images(new ArrayList<>())
                .variants(new ArrayList<>())
                .build();

        productRepository.save(product);

        List<ProductVariant> savedVariants = request.getVariants().stream().map(v -> {
            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .sku(v.getSku())
                    .weightVolume(v.getWeightVolume())
                    .importPrice(v.getImportPrice())
                    .price(v.getPrice())
                    .oldPrice(v.getOldPrice())
                    .stockQuantity(v.getStockQuantity())
                    .build();
            product.getVariants().add(variant);
            return variantRepository.save(variant);
        }).collect(Collectors.toList());

        for (ImageRequest img : request.getImages()) {
            ProductVariant matchedVariant = savedVariants.stream()
                    .filter(v -> v.getSku().equals(img.getSku()))
                    .findFirst().orElse(null);

            ProductImage pi = ProductImage.builder()
                    .product(product)
                    .variant(matchedVariant)
                    .imageUrl(img.getImageUrl())
                    .isPrimary(img.getIsPrimary())
                    .build();

            product.getImages().add(pi);
            productImageRepository.save(pi);
        }

        return mapToDetailResponse(product);
    }

    // ==========================================
    // 🔥 HÀM CẬP NHẬT SẢN PHẨM HOÀN CHỈNH
    // ==========================================
    @Transactional
    public ProductDetailResponse updateProduct(Long id, ProductRequest request) {
        // 1. Tìm sản phẩm gốc
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trên hệ thống!"));

        // 2. Cập nhật thông tin cơ bản
        product.setName(request.getName());
        product.setShortDesc(request.getShortDesc());
        product.setFullDesc(request.getFullDesc());
        product.setRegistrationNumber(request.getRegistrationNumber());
        product.setToxicityClass(request.getToxicityClass());
        product.setFormulation(request.getFormulation());
        product.setPhiDays(request.getPhiDays());
        product.setShelfLife(request.getShelfLife());
        product.setDosageRate(request.getDosageRate());
        product.setActiveIngredients(request.getActiveIngredients());
        product.setTargetCrops(request.getTargetCrops());
        product.setUsagePurpose(request.getUsagePurpose());
        product.setUsageInstructions(request.getUsageInstructions());
        product.setSafetyWarnings(request.getSafetyWarnings());
        product.setIsPublished(request.getIsPublished());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục được chọn"));
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu được chọn"));

        product.setCategory(category);
        product.setBrand(brand);

        // =========================================================================
        // 3. XỬ LÝ BIẾN THỂ AN TOÀN (KHÔNG DÙNG LỆNH DELETE TOÀN BỘ)
        // =========================================================================
        List<ProductVariant> currentVariants = product.getVariants();
        List<ProductVariant> updatedVariants = new ArrayList<>();

        for (VariantRequest vRequest : request.getVariants()) {
            // Tìm xem SKU này đã tồn tại ở sản phẩm này dưới DB chưa
            ProductVariant existingVariant = currentVariants.stream()
                    .filter(v -> v.getSku() != null && v.getSku().equalsIgnoreCase(vRequest.getSku().trim()))
                    .findFirst().orElse(null);

            if (existingVariant != null) {
                // NẾU CÓ RỒI: Chỉ cập nhật số liệu, TUYỆT ĐỐI KHÔNG XÓA ID
                existingVariant.setWeightVolume(vRequest.getWeightVolume());
                existingVariant.setImportPrice(vRequest.getImportPrice());
                existingVariant.setPrice(vRequest.getPrice());
                existingVariant.setOldPrice(vRequest.getOldPrice());
                existingVariant.setStockQuantity(vRequest.getStockQuantity());
                updatedVariants.add(variantRepository.save(existingVariant));
            } else {
                // NẾU CHƯA CÓ: Tạo biến thể mới hoàn toàn
                ProductVariant newVariant = ProductVariant.builder()
                        .product(product)
                        .sku(vRequest.getSku().trim())
                        .weightVolume(vRequest.getWeightVolume())
                        .importPrice(vRequest.getImportPrice())
                        .price(vRequest.getPrice())
                        .oldPrice(vRequest.getOldPrice())
                        .stockQuantity(vRequest.getStockQuantity())
                        .build();
                updatedVariants.add(variantRepository.save(newVariant));
            }
        }

        // Đồng bộ lại danh sách biến thể trong thực thể sản phẩm
        product.getVariants().clear();
        product.getVariants().addAll(updatedVariants);

        // =========================================================================
        // 4. XỬ LÝ HÌNH ẢNH AN TOÀN
        // =========================================================================
        // Ảnh tĩnh Cloudinary không bị ràng buộc đơn hàng, có thể dọn sạch rồi lưu mới
        productImageRepository.deleteByProductId(product.getId());
        product.getImages().clear();

        for (ImageRequest img : request.getImages()) {
            // Ánh xạ ảnh khớp với biến thể mới/vừa cập nhật thông qua chuỗi SKU
            ProductVariant matchedVariant = product.getVariants().stream()
                    .filter(v -> v.getSku() != null && v.getSku().equalsIgnoreCase(img.getSku()))
                    .findFirst().orElse(null);

            ProductImage pi = ProductImage.builder()
                    .product(product)
                    .variant(matchedVariant)
                    .imageUrl(img.getImageUrl())
                    .isPrimary(img.getIsPrimary())
                    .build();

            product.getImages().add(pi);
            productImageRepository.save(pi);
        }

        Product savedProduct = productRepository.save(product);
        return mapToDetailResponse(savedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        // 1. Tìm sản phẩm
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // 2. Gọi deleteById.
        // Hibernate sẽ chạy lệnh UPDATE thay vì DELETE, không làm ảnh hưởng tới các bảng khác
        productRepository.deleteById(id);
    }

    // ==========================================
    // CÁC HELPER MAPPING CHUẨN ĐỒNG BỘ
    // ==========================================
    private ProductCardResponse mapToCardResponse(Product product) {
        String imageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary).map(ProductImage::getImageUrl).findFirst()
                .orElse(product.getImages().isEmpty() ? "default-image.jpg" : product.getImages().get(0).getImageUrl());

        BigDecimal minPrice = product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        return ProductCardResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .primaryImageUrl(imageUrl)
                .minPrice(minPrice)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .build();
    }

    private ProductDetailResponse mapToDetailResponse(Product product) {
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getImageUrl).collect(Collectors.toList());

        if (imageUrls.isEmpty()) imageUrls.add("https://placehold.co/600x600/e2e8f0/64748b?text=No+Image");

        List<VariantResponse> variantResponses = product.getVariants().stream()
                .map(v -> VariantResponse.builder()
                        .id(v.getId())
                        .sku(v.getSku())
                        .weightVolume(v.getWeightVolume())
                        .price(v.getPrice())
                        .oldPrice(v.getOldPrice())
                        .importPrice(v.getImportPrice())
                        .stockQuantity(v.getStockQuantity())
                        .imageUrl(product.getImages().stream()
                                .filter(img -> img.getVariant() != null && img.getVariant().getId().equals(v.getId()))
                                .map(ProductImage::getImageUrl).findFirst().orElse(null))
                        .build())
                .collect(Collectors.toList());

        BigDecimal minPrice = product.getVariants().stream().map(ProductVariant::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal oldPrice = product.getVariants().stream().filter(v -> v.getPrice().compareTo(minPrice) == 0)
                .map(ProductVariant::getOldPrice).findFirst().orElse(null);

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brandName(product.getBrand() != null ? product.getBrand().getName() : "Agri Store")
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .minPrice(minPrice)
                .minOldPrice(oldPrice)
                .images(imageUrls)
                .shortDesc(product.getShortDesc())
                .fullDesc(product.getFullDesc())
                .registrationNumber(product.getRegistrationNumber())
                .toxicityClass(product.getToxicityClass())
                .formulation(product.getFormulation())
                .phiDays(product.getPhiDays())
                .activeIngredients(product.getActiveIngredients())
                .targetCrops(product.getTargetCrops())
                .usagePurpose(product.getUsagePurpose())
                .usageInstructions(product.getUsageInstructions())
                .safetyWarnings(product.getSafetyWarnings())
                .shelfLife(product.getShelfLife())
                .dosageRate(product.getDosageRate())
                .variants(variantResponses)
                .build();
    }
}