// ============================================
// src/pages/News.jsx
// ============================================

import { useEffect, useState } from 'react';

import {
  Newspaper,
  TrendingUp
} from 'lucide-react';

import NewsCard from '../components/NewsCard';

export default function News() {

  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchNews();

  }, []);

  const fetchNews = async () => {

    try {

      const res = await fetch(
        'http://localhost:8080/api/v1/posts/news'
      );

      const data = await res.json();

      setNews(data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f5]">
        <div className="text-gray-500 font-semibold">
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  const featured = news[0];

  return (
    <div className="bg-[#f5f7f5] min-h-screen py-8">

      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-10">

          <div className="flex items-center gap-2 mb-3">

            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Newspaper
                size={20}
                className="text-emerald-700"
              />
            </div>

            <div>

              <h1 className="text-3xl md:text-4xl font-black text-[#064e3b]">
                Tin Tức Nông Nghiệp
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Cập nhật kiến thức canh tác và thị trường mới nhất
              </p>

            </div>

          </div>

        </div>

        {/* FEATURED */}
        {featured && (

          <div className="mb-12">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-7">

                <a
                  href={`/tin-tuc/${featured.slug}`}
                  className="group block relative overflow-hidden rounded-3xl h-full min-h-[420px]"
                >

                  <img
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-7">

                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {featured.category}
                    </span>

                    <h2 className="text-white text-3xl font-black leading-tight mt-4 line-clamp-3">
                      {featured.title}
                    </h2>

                    <div className="flex items-center gap-4 mt-4 text-sm text-white/80">

                      <div className="flex items-center gap-1">
                        <TrendingUp size={16} />
                        {featured.viewCount || 0} lượt xem
                      </div>

                    </div>

                  </div>

                </a>

              </div>

              {/* RIGHT */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6">

                <div className="flex items-center justify-between mb-5">

                  <h3 className="font-black text-xl text-gray-800">
                    Mới cập nhật
                  </h3>

                </div>

                <div className="space-y-5">

                  {news.slice(1, 5).map(item => (

                    <a
                      href={`/tin-tuc/${item.slug}`}
                      key={item.id}
                      className="flex gap-4 group"
                    >

                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-28 h-24 object-cover rounded-2xl shrink-0"
                      />

                      <div>

                        <span className="text-[11px] font-bold text-emerald-700 uppercase">
                          {item.category}
                        </span>

                        <h4 className="font-bold text-gray-800 leading-snug line-clamp-2 mt-1 group-hover:text-emerald-700 transition">
                          {item.title}
                        </h4>

                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>

                      </div>

                    </a>

                  ))}

                </div>

              </div>

            </div>

          </div>
        )}

        {/* LIST */}
        <div>

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black text-gray-800">
              Tất cả bài viết
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {news.map(item => (

              <NewsCard
                key={item.id}
                item={item}
              />

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}