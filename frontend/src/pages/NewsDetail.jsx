// ============================================
// src/pages/NewsDetail.jsx
// ============================================

import {
  CalendarDays,
  Eye,
  ChevronRight
} from 'lucide-react';

import {
  Link,
  useParams
} from 'react-router-dom';

import {
  useEffect,
  useState
} from 'react';

export default function NewsDetail() {

  const { slug } = useParams();

  const [post, setPost] = useState(null);

  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchPost();

  }, [slug]);

  const fetchPost = async () => {

    try {

      const res = await fetch(
        `http://localhost:8080/api/v1/posts/news/${slug}`
      );

      const data = await res.json();

      setPost(data);

      const relatedRes = await fetch(
        `http://localhost:8080/api/v1/posts/news/${data.id}/related`
      );

      const relatedData = await relatedRes.json();

      setRelated(relatedData);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải bài viết...
      </div>
    );
  }

  if (!post) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7f5] py-8 min-h-screen">

      <div className="max-w-7xl mx-auto px-4">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">

          <Link
            to="/"
            className="hover:text-emerald-700"
          >
            Trang chủ
          </Link>

          <ChevronRight size={14} />

          <Link
            to="/tin-tuc"
            className="hover:text-emerald-700"
          >
            Tin tức
          </Link>

          <ChevronRight size={14} />

          <span className="text-emerald-700">
            {post.category}
          </span>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* CONTENT */}
          <div className="lg:col-span-8">

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">

              {/* THUMB */}
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-full h-[420px] object-cover"
              />

              <div className="p-6 md:p-10">

                {/* CATEGORY */}
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  {post.category}
                </span>

                {/* TITLE */}
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight mt-4">
                  {post.title}
                </h1>

                {/* META */}
                <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-gray-500 border-b border-gray-100 pb-6">

                  <div className="flex items-center gap-1">
                    <CalendarDays size={16} />
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    {post.viewCount || 0} lượt xem
                  </div>

                </div>

                {/* CONTENT */}
                <div
                  className="prose prose-lg max-w-none mt-8 article-content"
                  dangerouslySetInnerHTML={{
                    __html: post.content
                  }}
                />

              </div>

            </div>

          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4">

            <div className="bg-white rounded-3xl border border-gray-100 p-6 sticky top-24">

              <h3 className="text-xl font-black text-gray-800 mb-6">
                Bài viết liên quan
              </h3>

              <div className="space-y-5">

                {related.map(item => (

                  <Link
                    key={item.id}
                    to={`/tin-tuc/${item.slug}`}
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

                      <h4 className="font-bold text-gray-800 text-sm leading-snug mt-1 line-clamp-3 group-hover:text-emerald-700 transition">
                        {item.title}
                      </h4>

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