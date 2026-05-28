package com.agri.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {

    private Long id;

    private String title;

    private String slug;

    private String category;

    private String thumbnailUrl;

    private String content;

    private String videoUrl;

    private String videoType;

    private String postType;

    private Integer viewCount;

    private LocalDateTime createdAt;
}