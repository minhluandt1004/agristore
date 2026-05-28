import { useEffect, useState } from 'react';

import {
  PlayCircle,
  TrendingUp
} from 'lucide-react';

import { Link } from 'react-router-dom';

import VideoCard from '../components/VideoCard';

export default function VideoGallery() {

  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchVideos();

  }, []);

  const fetchVideos = async () => {

    try {

      const res = await fetch(
        'http://localhost:8080/api/v1/posts/videos'
      );

      const data = await res.json();

      setVideos(data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải video...
      </div>
    );
  }

  const featured = videos[0];

  return (

    <div className="bg-[#f5f7f5] min-h-screen py-8">

      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-10">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">

              <PlayCircle
                size={24}
                className="text-red-600"
              />

            </div>

            <div>

              <h1 className="text-3xl md:text-4xl font-black text-[#064e3b]">
                Video Nông Nghiệp
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Kho video kỹ thuật canh tác dành cho nhà nông
              </p>

            </div>

          </div>

        </div>

        {/* FEATURED */}
        {featured && (

          <div className="mb-12">

            <Link
              to={`/video/${featured.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#064e3b] rounded-[32px] overflow-hidden shadow-xl"
            >

              {/* VIDEO THUMB */}
              <div className="lg:col-span-7 relative min-h-[400px]">

                <img
                  src={featured.thumbnailUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30" />

                {/* play */}
                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-300">

                    <PlayCircle
                      size={48}
                      fill="currentColor"
                      className="text-white"
                    />

                  </div>

                </div>

              </div>

              {/* INFO */}
              <div className="lg:col-span-5 p-8 flex flex-col justify-center text-white">

                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full w-max uppercase tracking-wider">
                  Video nổi bật
                </span>

                <h2 className="text-3xl font-black leading-tight mt-5">
                  {featured.title}
                </h2>

                <div className="flex items-center gap-5 mt-5 text-sm text-white/80">

                  <div className="flex items-center gap-1">
                    <TrendingUp size={16} />
                    {featured.viewCount || 0} lượt xem
                  </div>

                </div>

                <div
                  className="text-white/80 mt-5 line-clamp-4 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: featured.content
                  }}
                />

                <div className="mt-8">

                  <div className="inline-flex items-center gap-2 bg-white text-[#064e3b] font-bold px-6 py-3 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition">

                    Xem video

                    <PlayCircle size={18} />

                  </div>

                </div>

              </div>

            </Link>

          </div>
        )}

        {/* GRID */}
        <div>

          <h2 className="text-2xl font-black text-gray-800 mb-6">
            Video mới nhất
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {videos.map(video => (

              <VideoCard
                key={video.id}
                video={video}
              />

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}