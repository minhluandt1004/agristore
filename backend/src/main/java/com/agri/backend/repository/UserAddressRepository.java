package com.agri.backend.repository;

import com.agri.backend.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByIdDesc(Long userId); // Lấy DS địa chỉ của user
    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Long userId); // Tìm địa chỉ mặc định
    @Query("SELECT u FROM UserAddress u WHERE u.user.id = :userId ORDER BY u.isDefault DESC, u.id DESC")
    List<UserAddress> findByUserIdCustomOrder(Long userId);
}