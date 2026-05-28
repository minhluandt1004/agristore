package com.agri.backend.dto;

import lombok.Data;

@Data
public class GuestRequest {
    private String phone;
    private String fullName;
    private String email;
}