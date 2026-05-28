package com.agri.backend.service;

import com.agri.backend.constants.Role;
import com.agri.backend.dto.*;
import com.agri.backend.entity.User;
import com.agri.backend.entity.UserAddress;
import com.agri.backend.repository.UserAddressRepository;
import com.agri.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartService cartService;
    private final OrderService orderService;

    // -------------------------------
    // 1. Register
    // -------------------------------
    @Transactional
    public UserResponse register(UserRegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        User existing = userRepository.findByPhone(request.getPhone()).orElse(null);

        // ===============================
        // CASE 1: SĐT đã tồn tại
        // ===============================
        if (existing != null) {

            boolean isGuest = Boolean.TRUE.equals(existing.getIsGuest());

            // isGuest = false hoặc null => tài khoản thật
            if (!isGuest) {
                throw new RuntimeException("Số điện thoại đã được sử dụng. Vui lòng đăng nhập.");
            }

            // isGuest = true => nâng cấp guest thành user thật
            existing.setFullName(request.getFullName());
            existing.setEmail(request.getEmail());
            existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            existing.setIsGuest(false);
            existing.setIsActive(true);
            existing.setRole(Role.CUSTOMER);

            User savedUser = userRepository.save(existing);

            return convertToUserResponse(savedUser);
        }

        // ===============================
        // CASE 2: SĐT chưa tồn tại
        // ===============================
        User newUser = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .isActive(true)
                .isGuest(false)
                .build();

        return convertToUserResponse(userRepository.save(newUser));
    }

    // -------------------------------
    // 2. Login
    // -------------------------------
    public UserResponse login(String phone, String password) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Số điện thoại không tồn tại!"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }
        return convertToUserResponse(user);
    }

    // -------------------------------
    // 3. Update profile
    // -------------------------------
    @Transactional
    public UserResponse updateProfile(Long userId, String fullName, String email) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(fullName);
        user.setEmail(email);
        return convertToUserResponse(userRepository.save(user));
    }

    // -------------------------------
    // 4. Change password
    // -------------------------------
    @Transactional
    public void changePassword(Long userId, PasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPasswordHash() == null) {
            throw new RuntimeException("Tài khoản chưa thiết lập mật khẩu!");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // -------------------------------
    // 5. Address management
    // -------------------------------
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdCustomOrder(userId).stream()
                .map(this::convertToAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse saveAddress(Long userId, Long addressId, AddressRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        UserAddress address = (addressId != null) ? addressRepository.findById(addressId).orElseThrow() : new UserAddress();

        if (request.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(old -> {
                        old.setIsDefault(false);
                        addressRepository.save(old);
                    });
        }

        address.setUser(user);
        address.setReceiverName(request.getReceiverName());
        address.setReceiverPhone(request.getReceiverPhone());
        address.setFullAddress(request.getFullAddress());
        address.setIsDefault(request.getIsDefault());

        return convertToAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }

    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        List<UserAddress> addresses = addressRepository.findByUserIdOrderByIdDesc(userId);
        addresses.forEach(a -> a.setIsDefault(false));

        UserAddress target = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ!"));

        if (!target.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa địa chỉ này!");
        }

        target.setIsDefault(true);
        addressRepository.saveAll(addresses);
    }

    // -------------------------------
    // 6. Guest / Merge
    // -------------------------------
    @Transactional
    public User createOrGetGuest(String phone, String fullName, String email) {
        User existingByPhone = userRepository.findByPhone(phone).orElse(null);

        if (existingByPhone != null) {
            boolean isGuest = Boolean.TRUE.equals(existingByPhone.getIsGuest());

            if (!isGuest) {
                throw new RuntimeException("Số điện thoại đã có tài khoản. Vui lòng đăng nhập để mua hàng.");
            }

            return existingByPhone;
        }

        String tempPassword = UUID.randomUUID().toString();

        return userRepository.save(
                User.builder()
                        .phone(phone)
                        .fullName(fullName != null && !fullName.isBlank() ? fullName : "Guest")
                        .email(email)
                        .passwordHash(passwordEncoder.encode(tempPassword))
                        .role(Role.CUSTOMER)
                        .isActive(true)
                        .isGuest(true)
                        .build()
        );
    }

    @Transactional
    public void mergeGuestCartToUser(Long guestUserId, Long userId) {
        cartService.mergeCartFromGuest(userId, guestUserId);
    }

    @Transactional
    public void mergeGuestOrders(Long guestUserId, Long userId) {
        orderService.mergeGuestOrders(userId, guestUserId);
    }

    // -------------------------------
    // 7. Check phone exists
    // -------------------------------
    public boolean existsByPhone(String phone) {
        User user = userRepository.findByPhone(phone).orElse(null);

        if (user == null) {
            return false;
        }

        // Chỉ TRUE mới là guest.
        // FALSE hoặc NULL đều xem là tài khoản thật đã được sử dụng.
        return !Boolean.TRUE.equals(user.getIsGuest());
    }

    public boolean existsByEmail(String email) {
        return false;
    }

    // -------------------------------
    // Mappers
    // -------------------------------
    public UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AddressResponse convertToAddressResponse(UserAddress addr) {
        return AddressResponse.builder()
                .id(addr.getId())
                .receiverName(addr.getReceiverName())
                .receiverPhone(addr.getReceiverPhone())
                .fullAddress(addr.getFullAddress())
                .isDefault(addr.getIsDefault())
                .build();
    }
}