package com.agri.backend.dto;
import lombok.Data;

@Data
public class AddressRequest {
    private String receiverName;
    private String receiverPhone;
    private String fullAddress;
    private Boolean isDefault;
}