import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  CheckCircle,
  PlayCircle,
  Star,
  FileText,
  Beaker,
  ChevronRight,
  Loader2,
  ShieldAlert,
  ListChecks,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateCartLocal } from '../store/cartSlice';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../api/apiConfig';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const SHOP_PHONE = '0365326142';
  const SHOP_PHONE_DISPLAY = '0863 999 086';
  const ZALO_LINK = `https://zalo.me/${SHOP_PHONE}`;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';

  const getImageUrl = (img) => {
    if (!img) return PLACEHOLDER_IMAGE;
    if (typeof img === 'string') return img;
    return img.imageUrl || img.url || img.path || PLACEHOLDER_IMAGE;
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);

        const detailRes = await fetch(`http://localhost:8080/api/v1/products/${slug}`);

        if (detailRes.ok) {
          const foundProduct = await detailRes.json();

          const productImages =
            foundProduct.images && foundProduct.images.length > 0
              ? foundProduct.images.map((img) => getImageUrl(img))
              : [PLACEHOLDER_IMAGE];

          const adaptedProduct = {
            id: foundProduct.id,
            slug: foundProduct.slug,
            name: foundProduct.name,
            brand: foundProduct.brandName || 'Agri Store',
            rating: Number(foundProduct.averageRating || 0),
            reviews: foundProduct.reviewCount || 0,
            images: productImages,
            videoUrl: foundProduct.reviewVideoUrl || '',
            shortDesc: foundProduct.shortDesc || 'Đang cập nhật mô tả ngắn.',
            fullDesc: foundProduct.fullDesc || '<p>Đang cập nhật thông tin chi tiết.</p>',
            usageInstructions: foundProduct.usageInstructions || 'Đang cập nhật hướng dẫn sử dụng.',
            safetyWarnings: foundProduct.safetyWarnings || '',
            specs: {
              registrationNumber: foundProduct.registrationNumber || 'Đang cập nhật',
              activeIngredients: foundProduct.activeIngredients || 'Đang cập nhật',
              formulation: foundProduct.formulation || 'Đang cập nhật',
              toxicityClass: foundProduct.toxicityClass || 'Đang cập nhật',
              phiDays: foundProduct.phiDays ? `${foundProduct.phiDays} ngày` : 'Đang cập nhật',
              targetCrops: foundProduct.targetCrops || 'Đa dạng cây trồng',
              usagePurpose: foundProduct.usagePurpose || 'Đang cập nhật',
            },
            categorySlug: foundProduct.categorySlug || '',
            categoryName: foundProduct.categoryName || 'Danh mục',
          };

          setProduct(adaptedProduct);

          let currentVariant = null;

          if (foundProduct.variants && foundProduct.variants.length > 0) {
            const sortedVariants = [...foundProduct.variants].sort((a, b) => a.price - b.price);
            setVariants(sortedVariants);
            setSelectedVariant(sortedVariants[0]);
            currentVariant = sortedVariants[0];
          } else {
            const fallbackVariant = {
              id: 0,
              weightVolume: 'Mặc định',
              price: Number(foundProduct.minPrice || 0),
              oldPrice: Number(foundProduct.minOldPrice || 0),
              stockQuantity: 100,
              imageUrl: null,
            };

            setVariants([fallbackVariant]);
            setSelectedVariant(fallbackVariant);
            currentVariant = fallbackVariant;
          }

          if (currentVariant?.imageUrl) {
            setMainImage(currentVariant.imageUrl);
          } else {
            setMainImage(productImages[0]);
          }

          const allRes = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS);

          if (allRes.ok) {
            const allData = await allRes.json();
            const productArray = Array.isArray(allData) ? allData : allData.content || [];

            let related = productArray.filter(
              (p) => p.categorySlug === adaptedProduct.categorySlug && p.slug !== slug
            );

            if (related.length < 4) {
              const otherProducts = productArray.filter(
                (p) => p.categorySlug !== adaptedProduct.categorySlug && p.slug !== slug
              );
              related = [...related, ...otherProducts];
            }

            const finalRelated = related.slice(0, 4).map((p) => {
              const rMin = Number(p.minPrice || p.price || 0);
              const rOld = Number(p.minOldPrice || p.oldPrice || 0);

              return {
                id: p.id,
                slug: p.slug,
                name: p.name,
                image: p.primaryImageUrl || p.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
                price: rMin,
                oldPrice: rOld,
                discount: rOld > rMin ? Math.round(((rOld - rMin) / rOld) * 100) : 0,
                rating: Number(p.averageRating || 0),
                reviewCount: p.reviewCount || 0,
                categoryName: p.categoryName,
              };
            });

            setRelatedProducts(finalRelated);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết sản phẩm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      return toast.error('Vui lòng chọn phân loại sản phẩm!');
    }

    const itemData = {
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      weightVolume: selectedVariant.weightVolume,
      price: selectedVariant.price,
      image: selectedVariant.imageUrl || mainImage || product.images?.[0] || '',
    };

    dispatch(
      updateCartLocal({
        variantId: selectedVariant.id,
        amount: quantity,
        itemData,
      })
    );

    const user = JSON.parse(localStorage.getItem('user'));

    if (user?.id) {
      try {
        await fetch(`http://localhost:8080/api/v1/cart/${user.id}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: selectedVariant.id,
            quantity,
          }),
        });
      } catch (err) {
        console.error('Lỗi đồng bộ DB:', err);
      }
    }

    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return toast.error('Vui lòng chọn phân loại!');

    const itemToBuy = {
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      weightVolume: selectedVariant.weightVolume,
      price: selectedVariant.price,
      quantity,
      image: selectedVariant.imageUrl || mainImage || product.images?.[0] || '',
    };

    navigate('/thanh-toan', { state: { buyNowItem: itemToBuy } });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f2f5f3] text-green-700">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-bold text-lg">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f2f5f3] px-4 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1178/1178479.png"
          alt="Không tìm thấy sản phẩm"
          className="w-24 h-24 opacity-30 mb-4"
        />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-500 mb-6">Đường dẫn không chính xác hoặc sản phẩm đã ngừng kinh doanh.</p>
        <button
          onClick={() => navigate('/danh-muc')}
          className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  const variantDiscount =
    selectedVariant?.oldPrice > selectedVariant?.price
      ? Math.round(((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100)
      : 0;

  const isOutOfStock = selectedVariant?.stockQuantity === 0;

  return (
    <div className="bg-[#f2f5f3] pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-green-700">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <Link to={`/danh-muc?category=${product.categorySlug}`} className="hover:text-green-700">
            {product.categoryName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 line-clamp-1">{product.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:divide-x divide-gray-100">
            <div className="p-5 md:p-8">
              <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border border-gray-100 mb-5 group relative">
                <img
                  src={mainImage || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>

              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`shrink-0 w-20 h-20 rounded-xl border-2 cursor-pointer transition-all overflow-hidden p-1 bg-white ${
                      mainImage === img ? 'border-green-700 ring-2 ring-green-100' : 'border-gray-100 hover:border-green-300'
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-contain"
                      alt={`Ảnh sản phẩm ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </button>
                ))}

                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 w-20 h-20 rounded-xl border-2 border-orange-100 bg-orange-50 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition"
                  >
                    <PlayCircle size={24} className="text-orange-600" />
                    <span className="text-[10px] font-bold text-orange-600 mt-1">Video</span>
                  </a>
                )}
              </div>
            </div>

            <div className="p-5 md:p-8 flex flex-col">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-green-700">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Mã sản phẩm:{' '}
                  <strong className="text-green-700">
                    {selectedVariant?.sku || product.slug.substring(0, 10).toUpperCase()}
                  </strong>
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-4 py-2 mb-5">
                <span className="text-3xl md:text-4xl font-bold text-red-600">
                  {selectedVariant?.price.toLocaleString('vi-VN')}đ
                </span>

                {selectedVariant?.oldPrice > selectedVariant?.price && (
                  <>
                    <span className="text-lg md:text-xl text-gray-400 line-through font-medium">
                      {selectedVariant.oldPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md border border-red-200">
                      -{variantDiscount}%
                    </span>
                  </>
                )}
              </div>

              {variants.length > 0 && variants[0].id !== 0 && (
                <div className="mb-5">
                  <p className="font-bold text-gray-800 text-sm mb-2">Chọn quy cách</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.imageUrl) setMainImage(v.imageUrl);
                        }}
                        className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-green-700 text-green-700 bg-green-50'
                            : 'border-gray-300 text-gray-700 hover:border-green-500 bg-white'
                        }`}
                      >
                        {v.weightVolume}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-700 text-sm md:text-base leading-relaxed border-l-4 border-green-600 pl-4 bg-green-50/60 py-3 rounded-r-xl mb-6">
                {product.shortDesc}
              </p>

              <div className="mt-auto pt-5 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-4 mb-5">
                  <span className="font-bold text-gray-800 text-sm">Số lượng:</span>
                  <div className="flex items-center bg-white rounded-xl px-2 py-1 border border-gray-300 w-32 justify-between">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-600 hover:text-green-700 font-bold text-xl w-8 text-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-gray-600 hover:text-green-700 font-bold text-xl w-8 text-center"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {selectedVariant?.stockQuantity > 0
                      ? `Còn ${selectedVariant.stockQuantity} sản phẩm`
                      : 'Hết hàng'}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 rounded-xl flex flex-col items-center justify-center transition shadow-sm"
                  >
                    <span className="font-bold text-lg uppercase tracking-wide">Mua ngay</span>
                    <span className="text-xs font-medium opacity-90">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="w-full bg-white border-2 border-green-700 text-green-700 disabled:border-gray-300 disabled:text-gray-400 hover:bg-green-50 py-3 rounded-xl font-bold uppercase transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} /> Thêm vào giỏ
                  </button>

                  <div className="mt-2 rounded-2xl border border-green-100 bg-green-50 p-4">
                    <p className="text-sm font-bold text-green-900 mb-3">
                      Cần tư vấn cách dùng hoặc đặt hàng nhanh?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href={`tel:${SHOP_PHONE}`}
                        className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-bold text-base transition"
                      >
                        <Phone size={20} /> Gọi ngay
                      </a>

                      <a
                        href={ZALO_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-bold text-base transition"
                      >
                        <MessageCircle size={20} /> Chat Zalo
                      </a>
                    </div>

                    <p className="text-xs text-gray-600 mt-3 text-center">
                      Hotline/Zalo:{' '}
                      <span className="font-bold text-gray-900">{SHOP_PHONE_DISPLAY}</span> · Tư vấn phân bón, thuốc BVTV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 mb-14">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap custom-scrollbar">
                {[
                  { id: 'description', label: 'Thông tin chung', icon: <FileText size={16} /> },
                  { id: 'specs', label: 'Thông số kỹ thuật', icon: <ListChecks size={16} /> },
                  { id: 'usage', label: 'Hướng dẫn sử dụng', icon: <Beaker size={16} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[150px] py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                      activeTab === tab.id ? 'bg-green-800 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 md:p-8">
                {activeTab === 'description' && (
                  <div
                    className="animate-fade-in prose prose-green max-w-none text-gray-700 leading-relaxed text-sm md:text-base
                              prose-img:rounded-2xl prose-img:mx-auto prose-img:my-5
                              prose-img:max-w-full prose-img:h-auto
                              prose-strong:text-gray-900
                              prose-ul:list-disc prose-ol:list-decimal"
                    dangerouslySetInnerHTML={{ __html: product.fullDesc }}
                  />
                )}

                {activeTab === 'specs' && (
                  <div className="animate-fade-in overflow-x-auto">
                    <table className="w-full text-left text-sm md:text-base border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-gray-500 font-medium w-1/3">Số đăng ký</th>
                          <td className="py-3 font-bold text-gray-800">{product.specs.registrationNumber}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-gray-500 font-medium">Hoạt chất</th>
                          <td className="py-3 font-bold text-gray-800">{product.specs.activeIngredients}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-gray-500 font-medium">Dạng bào chế</th>
                          <td className="py-3 font-bold text-gray-800">{product.specs.formulation}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-gray-500 font-medium">Nhóm độc</th>
                          <td className="py-3 font-bold text-red-600">{product.specs.toxicityClass}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-gray-500 font-medium">Cây trồng mục tiêu</th>
                          <td className="py-3 font-bold text-gray-800">{product.specs.targetCrops}</td>
                        </tr>
                        <tr>
                          <th className="py-3 text-gray-500 font-medium align-top">Công dụng chính</th>
                          <td className="py-3 font-bold text-gray-800">{product.specs.usagePurpose}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'usage' && (
                  <div className="animate-fade-in space-y-6">
                    <div>
                      <h4 className="font-bold text-green-800 mb-3 text-lg flex items-center gap-2">
                        <CheckCircle size={20} /> Hướng dẫn sử dụng
                      </h4>
                      <div
                        className="prose max-w-none text-gray-700 text-sm md:text-base"
                        dangerouslySetInnerHTML={{ __html: product.usageInstructions }}
                      />
                    </div>

                    {product.safetyWarnings && (
                      <div className="bg-red-50 border border-red-200 p-5 rounded-xl mt-6">
                        <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                          <ShieldAlert size={20} /> Cảnh báo an toàn
                        </h4>
                        <div
                          className="text-red-600 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: product.safetyWarnings }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white text-gray-800 p-6 rounded-3xl shadow-sm border border-green-100">
              <h3 className="text-lg font-bold mb-5 text-green-800">Cam kết của cửa hàng</h3>

              <div className="space-y-5">
                {[
                  { title: 'Hàng đúng mô tả', desc: 'Sản phẩm rõ quy cách, rõ giá bán.' },
                  { title: 'Tư vấn dễ hiểu', desc: 'Hỗ trợ cách dùng phù hợp cây trồng.' },
                  { title: 'Giao hàng tận nơi', desc: 'Cửa hàng sẽ gọi xác nhận trước khi giao.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle className="text-green-700 shrink-0" size={20} />
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">Cần hỏi nhanh về sản phẩm?</p>
                <a
                  href={`tel:${SHOP_PHONE}`}
                  className="block w-full text-center bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-bold transition"
                >
                  Gọi {SHOP_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-gray-200 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">
                  Sản phẩm đi kèm gợi ý
                </h2>
                <p className="text-gray-500 text-sm mt-1">Một số sản phẩm khách hàng thường xem cùng</p>
              </div>
              <Link
                to={`/danh-muc?category=${product.categorySlug}`}
                className="text-green-700 font-bold text-sm hover:text-orange-500 hover:underline uppercase transition-colors shrink-0"
              >
                Xem tất cả {product.categoryName} →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
