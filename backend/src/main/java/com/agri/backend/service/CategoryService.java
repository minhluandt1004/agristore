package com.agri.backend.service;

import com.agri.backend.dto.CategoryDTO;
import com.agri.backend.entity.Category;
import com.agri.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Dùng cái này thay cho @Autowired
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Đổi tên hàm và viết lại logic Gom Cây (Cha ôm Con)
    public List<CategoryDTO> getAllCategoriesTree() {
        // 1. Lấy toàn bộ danh mục dưới DB (Cả cha lẫn con)
        List<Category> allCategories = categoryRepository.findAll();

        // 2. Chuyển đổi từ Entity sang DTO
        List<CategoryDTO> allDtos = allCategories.stream().map(cat -> {
            CategoryDTO dto = new CategoryDTO();
            dto.setId(cat.getId());
            dto.setParentId(cat.getParentId());
            dto.setName(cat.getName());
            dto.setSlug(cat.getSlug());
            dto.setChildren(new ArrayList<>()); // Khởi tạo mảng rỗng sẵn
            return dto;
        }).collect(Collectors.toList());

        // 3. Thuật toán: Nhét con vào bụng cha
        List<CategoryDTO> rootCategories = new ArrayList<>();

        for (CategoryDTO dto : allDtos) {
            if (dto.getParentId() == null) {
                // Nếu không có parent -> Là mục gốc (Cha) -> Thêm vào list tổng
                rootCategories.add(dto);
            } else {
                // Nếu có parent -> Tìm thằng cha của nó và nhét nó vào list children
                allDtos.stream()
                        .filter(parent -> parent.getId().equals(dto.getParentId()))
                        .findFirst()
                        .ifPresent(parent -> parent.getChildren().add(dto));
            }
        }

        // Trả về list Cha (bên trong đã ngậm sẵn các list Con)
        return rootCategories;
    }
}