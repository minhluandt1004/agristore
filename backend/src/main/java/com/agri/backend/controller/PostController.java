package com.agri.backend.controller;

import com.agri.backend.entity.Post;
import com.agri.backend.service.PostService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PostController {

    private final PostService postService;

    // =====================================
    // NEWS LIST
    // =====================================
    @GetMapping("/news")
    public List<Post> getNewsPosts() {

        return postService.getNewsPosts();
    }

    // =====================================
    // VIDEO LIST
    // =====================================
    @GetMapping("/videos")
    public List<Post> getVideoPosts() {

        return postService.getVideoPosts();
    }

    // =====================================
    // NEWS DETAIL
    // =====================================
    @GetMapping("/news/{slug}")
    public Post getNewsDetail(
            @PathVariable String slug
    ) {

        return postService.getNewsDetail(slug);
    }

    // =====================================
    // VIDEO DETAIL
    // =====================================
    @GetMapping("/videos/{slug}")
    public Post getVideoDetail(
            @PathVariable String slug
    ) {

        return postService.getVideoDetail(slug);
    }

    // =====================================
    // RELATED NEWS
    // =====================================
    @GetMapping("/news/{id}/related")
    public List<Post> getRelatedNews(
            @PathVariable Long id
    ) {

        return postService.getRelatedNews(id);
    }

    // =====================================
    // RELATED VIDEOS
    // =====================================
    @GetMapping("/videos/{id}/related")
    public List<Post> getRelatedVideos(
            @PathVariable Long id
    ) {

        return postService.getRelatedVideos(id);
    }

    // =====================================
    // CREATE
    // =====================================
    @PostMapping
    public Post createPost(
            @RequestBody Post post
    ) {

        return postService.createPost(post);
    }

    // =====================================
    // UPDATE
    // =====================================
    @PutMapping("/{id}")
    public Post updatePost(
            @PathVariable Long id,
            @RequestBody Post post
    ) {

        return postService.updatePost(id, post);
    }

    // =====================================
    // DELETE
    // =====================================
    @DeleteMapping("/{id}")
    public void deletePost(
            @PathVariable Long id
    ) {

        postService.deletePost(id);
    }
}