import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import NewsCard from '../components/NewsCard';
import VideoCard from '../components/VideoCard';
import { Link } from 'react-router-dom';
import { Loader2, ChevronDown } from 'lucide-react';
import { API_ENDPOINTS } from '../api/apiConfig';

const categoryIcons = ["🌱", "🧪", "🐛", "💧", "🌿", "🌾"];

export default function Home() {
  const [groupedCategories, setGroupedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCats, setExpandedCats] = useState([]);
  const [homeNews, setHomeNews] = useState([]);
  const [homeVideos, setHomeVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const catResponse = await fetch("http://localhost:8080/api/v1/categories");
        let catData = [];
        if (catResponse.ok) {
          catData = await catResponse.json();
          setCategories(catData);
        }

        const prodResponse = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!prodResponse.ok) throw new Error("Không thể tải sản phẩm");

        const prodData = await prodResponse.json();
        const productArray = Array.isArray(prodData) ? prodData : (prodData.content || []);

        const dynamicGroupedData = [];

        catData.forEach(rootCat => {
          const validSlugs = [rootCat.slug];

          if (rootCat.children) {
            rootCat.children.forEach(child => validSlugs.push(child.slug));
          }

          const categoryProducts = productArray.filter(p =>
            validSlugs.includes(p.categorySlug)
          );

          if (categoryProducts.length > 0) {
            dynamicGroupedData.push({
              categoryId: rootCat.id,
              categoryName: rootCat.name,
              categorySlug: rootCat.slug,
              products: categoryProducts.slice(0, 8)
            });
          }
        });

        setGroupedCategories(dynamicGroupedData);

        const newsResponse = await fetch("http://localhost:8080/api/v1/posts/news");
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          setHomeNews(newsData.slice(0, 2));
        }

        const videoResponse = await fetch("http://localhost:8080/api/v1/posts/videos");
        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          setHomeVideos(videoData.slice(0, 2));
        }

      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f5] text-emerald-600">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-bold text-lg">Đang tải nông cụ và phân bón...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6 bg-[#f4f7f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex gap-6 mb-12">

          <aside className="w-[260px] bg-white rounded-b-xl rounded-tr-xl shadow-sm hidden lg:block border border-gray-100 shrink-0 self-start">
            <div className="bg-emerald-600 text-white font-black px-4 py-3 rounded-t-xl uppercase tracking-wider text-sm">
              Danh mục sản phẩm
            </div>

            <div className="flex flex-col py-1">
              {categories.length > 0 ? (
                categories.map((cat, index) => {
                  const isExpanded = expandedCats.includes(cat.id);
                  const hasChildren = cat.children && cat.children.length > 0;

                  return (
                    <div key={cat.id} className="flex flex-col border-b border-gray-50 last:border-0 group">
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 transition">
                        <Link
                          to={`/danh-muc?category=${cat.slug}`}
                          className="flex items-center gap-3 text-gray-700 hover:text-emerald-700 font-semibold text-sm flex-1"
                        >
                          <span className="text-xl w-6 text-center">
                            {categoryIcons[index % categoryIcons.length]}
                          </span>
                          {cat.name}
                        </Link>

                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setExpandedCats(prev =>
                                prev.includes(cat.id)
                                  ? prev.filter(id => id !== cat.id)
                                  : [...prev, cat.id]
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-emerald-600 bg-white rounded-md transition-colors shadow-sm border border-gray-100"
                          >
                            <ChevronDown
                              size={14}
                              className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="bg-emerald-50/30 flex flex-col py-2 px-4 gap-2 border-t border-gray-50">
                          {cat.children.map(child => (
                            <Link
                              key={child.id}
                              to={`/danh-muc?category=${child.slug}`}
                              className="text-sm text-gray-500 hover:text-emerald-600 pl-9 py-1.5 flex items-center gap-2 transition-colors font-medium"
                            >
                              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                  Đang tải...
                </div>
              )}
            </div>

            <div className="m-4 p-4 bg-orange-50 rounded-lg border border-orange-100 flex flex-col items-center text-center">
              <span className="text-2xl mb-2">👨‍🌾</span>
              <p className="text-sm font-bold text-gray-800 mb-1">
                Cần tư vấn dùng thuốc?
              </p>
              <button className="bg-orange-500 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-orange-600 w-full mt-2 transition">
                Gọi 0863.999.086
              </button>
            </div>
          </aside>

          <div className="flex-1 rounded-2xl overflow-hidden shadow-sm relative flex items-center min-h-[420px] bg-emerald-900">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1200"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
              alt="Banner"
            />

            <div className="relative z-10 px-10 max-w-2xl text-white">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-xs font-black uppercase tracking-widest mb-5 inline-block">
                Mùa Vụ Bội Thu
              </span>

              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                GIẢI PHÁP DINH DƯỠNG<br />
                <span className="text-yellow-300">TOÀN DIỆN CHO CÂY</span>
              </h2>

              <p className="text-lg text-emerald-50 mb-8 max-w-md">
                Cung cấp phân bón chính hãng, chế phẩm sinh học giúp rễ khỏe, mầm mập, bung đọt cực mạnh.
              </p>

              <Link
                to="/san-pham"
                className="inline-block bg-yellow-400 text-green-900 px-8 py-3.5 rounded-xl font-black hover:bg-white transition-colors shadow-lg text-sm uppercase tracking-wide"
              >
                Mua Ngay Kho Phân Bón
              </Link>
            </div>
          </div>
        </div>

        {groupedCategories.map((category) => (
          <div
            key={category.categoryId}
            className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-12"
          >
            <div className="px-6 py-4 border-b border-emerald-50 flex flex-wrap justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
              <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-tight flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
                {category.categoryName}
              </h2>

              <Link
                to={`/danh-muc?category=${category.categorySlug}`}
                className="text-emerald-600 font-bold hover:text-orange-500 transition text-sm"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-5 gap-4 md:gap-6 bg-white">
              {Array.isArray(category.products) &&
                category.products.map((product) => {
                  const minPrice = Number(product.minPrice || product.price || 0);
                  const oldPrice = Number(product.minOldPrice || product.oldPrice || 0);
                  const hasDiscount = oldPrice > minPrice;
                  const calculatedDiscount = hasDiscount
                    ? Math.round(((oldPrice - minPrice) / oldPrice) * 100)
                    : 0;

                  const adaptedProduct = {
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: product.primaryImageUrl || product.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
                    price: minPrice,
                    oldPrice: oldPrice,
                    discount: calculatedDiscount,
                    rating: Number(product.averageRating || 0),
                    reviewCount: product.reviewCount || 0,
                    categoryName: product.categoryName,
                    shortDescription: product.shortDescription || ""
                  };

                  return (
                    <ProductCard
                      key={product.id}
                      product={adaptedProduct}
                    />
                  );
                })}
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
          <section>
            <div className="flex justify-between items-end mb-6 border-l-4 border-emerald-600 pl-4">
              <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                Kiến thức nông nghiệp
              </h2>

              <Link
                to="/tin-tuc"
                className="text-emerald-600 font-bold hover:underline text-sm"
              >
                Tất cả bài viết
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {homeNews.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="bg-[#064e3b] p-6 md:p-8 rounded-2xl h-full shadow-lg relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 opacity-20 rounded-full blur-2xl"></div>

              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight relative z-10">
                Video hướng dẫn
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {homeVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}