import {
  CalendarDays,
  Eye,
  ChevronRight,
  PlayCircle
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function VideoDetail() {
  const { slug } = useParams();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, [slug]);

  const fetchVideo = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/posts/videos/${slug}`
      );

      const data = await res.json();
      setVideo(data);

      const relatedRes = await fetch(
        `http://localhost:8080/api/v1/posts/videos/${data.id}/related`
      );

      const relatedData = await relatedRes.json();
      setRelated(relatedData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Parse YouTube URL an toàn (hỗ trợ nhiều dạng link)
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    // dạng watch?v=
    if (url.includes("watch?v=")) {
      const videoId = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // dạng youtu.be
    if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // fallback nếu đã là embed
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải video...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy video
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7f5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/video">Video</Link>
          <ChevronRight size={14} />
          <span className="text-emerald-700">{video.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

              {/* VIDEO */}
              <div className="aspect-video bg-black">

                {video.videoType === "YOUTUBE" ? (
                  <iframe
                    src={getYouTubeEmbedUrl(video.videoUrl)}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}

              </div>

              {/* CONTENT */}
              <div className="p-6 md:p-10">

                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                  VIDEO
                </span>

                <h1 className="text-3xl md:text-4xl font-black text-gray-800 mt-5 leading-tight">
                  {video.title}
                </h1>

                {/* META */}
                <div className="flex items-center gap-5 mt-5 border-b border-gray-100 pb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    {video.viewCount || 0}
                  </div>

                  <div className="flex items-center gap-1">
                    <CalendarDays size={16} />
                    {new Date(video.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                {/* CONTENT HTML */}
                <div
                  className="prose prose-lg max-w-none mt-8"
                  dangerouslySetInnerHTML={{
                    __html: video.content
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24">

              <h3 className="text-xl font-black text-gray-800 mb-6">
                Video liên quan
              </h3>

              <div className="space-y-5">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/video/${item.slug}`}
                    className="flex gap-4 group"
                  >
                    <div className="relative">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-32 h-20 object-cover rounded-2xl"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle
                          size={28}
                          fill="currentColor"
                          className="text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-3 group-hover:text-emerald-700 transition">
                        {item.title}
                      </h4>

                      <div className="text-xs text-gray-400 mt-2">
                        {item.viewCount || 0} lượt xem
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}