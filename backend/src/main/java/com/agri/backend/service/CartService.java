package com.agri.backend.service;

import com.agri.backend.dto.CartItemResponse;
import com.agri.backend.dto.CartMergeRequest;
import com.agri.backend.entity.CartItem;
import com.agri.backend.entity.ProductVariant;
import com.agri.backend.repository.CartItemRepository;
import com.agri.backend.repository.ProductVariantRepository;
import com.agri.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateCart(Long userId, Long variantId, int delta) {
        CartItem item = cartRepository
                .findByUserIdAndVariantId(userId, variantId)
                .orElseGet(() -> CartItem.builder()
                        .user(userRepository.findById(userId).orElseThrow())
                        .variant(variantRepository.findById(variantId).orElseThrow())
                        .quantity(0)
                        .build());

        item.setQuantity(item.getQuantity() + delta);

        if (item.getQuantity() <= 0) {
            cartRepository.delete(item);
        } else {
            cartRepository.save(item);
        }
    }

    @Transactional
    public void mergeCart(Long userId, CartMergeRequest request) {
        for (CartMergeRequest.LocalItem local : request.getItems()) {
            updateCart(userId, local.getVariantId(), local.getQuantity());
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long variantId) {
        cartRepository.deleteByUserIdAndVariantId(userId, variantId);
    }

    // Merge guest cart vào user
    @Transactional
    public void mergeCartFromGuest(Long userId, Long guestUserId) {
        if (userId.equals(guestUserId)) {
            return;
        }

        List<CartItem> guestItems = cartRepository.findByUserId(guestUserId);

        for (CartItem guestItem : guestItems) {
            Long variantId = guestItem.getVariant().getId();

            CartItem existing = cartRepository.findByUserIdAndVariantId(userId, variantId)
                    .orElse(null);

            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + guestItem.getQuantity());
                cartRepository.save(existing);

                // Chỉ xóa item guest nếu đã cộng vào item user có sẵn
                cartRepository.delete(guestItem);
            } else {
                // Chuyển item guest sang user chính, KHÔNG xóa sau đó
                guestItem.setUser(userRepository.findById(userId).orElseThrow());
                cartRepository.save(guestItem);
            }
        }
    }

    private CartItemResponse mapToResponse(CartItem item) {
        ProductVariant v = item.getVariant();
        String image = v.getProduct().getImages()
                .stream()
                .filter(img -> img.getVariant() != null && img.getVariant().getId().equals(v.getId()))
                .map(img -> img.getImageUrl())
                .findFirst()
                .orElseGet(() -> v.getProduct().getImages()
                        .stream()
                        .filter(img -> img.getIsPrimary())
                        .map(img -> img.getImageUrl())
                        .findFirst()
                        .orElse(""));

        return CartItemResponse.builder()
                .variantId(v.getId())
                .productId(v.getProduct().getId())
                .name(v.getProduct().getName())
                .image(image)
                .weightVolume(v.getWeightVolume())
                .price(v.getPrice().doubleValue())
                .quantity(item.getQuantity())
                .build();
    }
}