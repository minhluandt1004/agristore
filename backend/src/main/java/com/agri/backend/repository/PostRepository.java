package com.agri.backend.repository;

import com.agri.backend.constants.PostType;
import com.agri.backend.entity.Post;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    // =====================================
    // NEWS
    // =====================================
    List<Post> findByPostTypeAndIsPublishedTrueOrderByCreatedAtDesc(
            PostType postType
    );

    Optional<Post> findBySlugAndPostTypeAndIsPublishedTrue(
            String slug,
            PostType postType
    );

    List<Post> findTop4ByPostTypeAndIsPublishedTrueAndIdNotOrderByCreatedAtDesc(
            PostType postType,
            Long id
    );
}