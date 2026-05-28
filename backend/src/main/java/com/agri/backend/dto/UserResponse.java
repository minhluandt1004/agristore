package com.agri.backend.dto;

import com.agri.backend.constants.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private Role role;
}