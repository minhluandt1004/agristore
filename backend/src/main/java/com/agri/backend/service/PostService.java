package com.agri.backend.service;

import com.agri.backend.constants.PostType;
import com.agri.backend.entity.Post;
import com.agri.backend.repository.PostRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    // =====================================
    // NEWS LIST
    // =====================================
    public List<Post> getNewsPosts() {

        return postRepository
                .findByPostTypeAndIsPublishedTrueOrderByCreatedAtDesc(
                        PostType.NEWS
                );
    }

    // =====================================
    // VIDEO LIST
    // =====================================
    public List<Post> getVideoPosts() {

        return postRepository
                .findByPostTypeAndIsPublishedTrueOrderByCreatedAtDesc(
                        PostType.VIDEO
                );
    }

    // =====================================
    // NEWS DETAIL
    // =====================================
    public Post getNewsDetail(String slug) {

        Post post = postRepository
                .findBySlugAndPostTypeAndIsPublishedTrue(
                        slug,
                        PostType.NEWS
                )
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy bài viết")
                );

        post.setViewCount(post.getViewCount() + 1);

        return postRepository.save(post);
    }

    // =====================================
    // VIDEO DETAIL
    // =====================================
    public Post getVideoDetail(String slug) {

        Post post = postRepository
                .findBySlugAndPostTypeAndIsPublishedTrue(
                        slug,
                        PostType.VIDEO
                )
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy video")
                );

        post.setViewCount(post.getViewCount() + 1);

        return postRepository.save(post);
    }

    // =====================================
    // RELATED NEWS
    // =====================================
    public List<Post> getRelatedNews(Long id) {

        return postRepository
                .findTop4ByPostTypeAndIsPublishedTrueAndIdNotOrderByCreatedAtDesc(
                        PostType.NEWS,
                        id
                );
    }

    // =====================================
    // RELATED VIDEO
    // =====================================
    public List<Post> getRelatedVideos(Long id) {

        return postRepository
                .findTop4ByPostTypeAndIsPublishedTrueAndIdNotOrderByCreatedAtDesc(
                        PostType.VIDEO,
                        id
                );
    }

    // =====================================
    // CREATE
    // =====================================
    public Post createPost(Post post) {

        return postRepository.save(post);
    }

    // =====================================
    // UPDATE
    // =====================================
    public Post updatePost(Long id, Post newPost) {

        Post post = postRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy bài viết")
                );

        post.setTitle(newPost.getTitle());
        post.setSlug(newPost.getSlug());
        post.setCategory(newPost.getCategory());
        post.setThumbnailUrl(newPost.getThumbnailUrl());
        post.setContent(newPost.getContent());

        post.setPostType(newPost.getPostType());

        post.setVideoUrl(newPost.getVideoUrl());
        post.setVideoType(newPost.getVideoType());

        post.setIsPublished(newPost.getIsPublished());

        return postRepository.save(post);
    }

    // =====================================
    // DELETE
    // =====================================
    public void deletePost(Long id) {

        postRepository.deleteById(id);
    }
}