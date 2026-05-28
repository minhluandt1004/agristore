package com.agri.backend.repository;

import com.agri.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo số điện thoại
    Optional<User> findByPhone(String phone);

    // Tìm user theo email
    Optional<User> findByEmail(String email);

    boolean existsByPhoneAndIsGuestFalse(String phone);

    boolean existsByEmailAndIsGuestFalse(String email);

    Optional<User> findByPhoneAndIsGuestFalse(String phone);

    Optional<User> findByEmailAndIsGuestFalse(String email);
}