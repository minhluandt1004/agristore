package com.agri.backend.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String fullAddress;
    private Boolean isDefault;
}