package com.agri.backend.service;

import com.agri.backend.entity.Brand;
import com.agri.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    // Thêm hàm này để lấy danh sách thương hiệu
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }
}