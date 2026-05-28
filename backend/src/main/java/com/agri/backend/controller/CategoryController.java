package com.agri.backend.controller;

import com.agri.backend.dto.CategoryDTO;
import com.agri.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@CrossOrigin("*")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getCategories() {
        // Gọi hàm mới getAllCategoriesTree()
        List<CategoryDTO> response = categoryService.getAllCategoriesTree();
        return ResponseEntity.ok(response);
    }
}