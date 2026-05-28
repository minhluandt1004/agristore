package com.agri.backend.entity;

import com.agri.backend.constants.PostType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Column(name = "category")
    private String category; // Ví dụ: Kỹ thuật, Thị trường, Chia sẻ kinh nghiệm

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    // --- PHẦN DÀNH CHO VIDEO ---
    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false)
    private PostType postType = PostType.NEWS;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_type")
    private String videoType; // Ví dụ: 'YOUTUBE', 'VIMEO', 'LOCAL' (giúp FE chọn Player phù hợp)

    // --- PHẦN NỘI DUNG ---
    @Column(columnDefinition = "TEXT")
    private String content; // Nếu là NEWS thì đây là nội dung chính, nếu là VIDEO thì đây là phần mô tả video

    @Column(name = "is_published")
    private Boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "view_count")
    private Integer viewCount = 0; // Thêm trường này để làm tính năng "Bài viết phổ biến"
}