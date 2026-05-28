package com.agri.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryDTO {
    private Long id;
    private Long parentId;
    private String name;
    private String slug;
    private List<CategoryDTO> children;
}