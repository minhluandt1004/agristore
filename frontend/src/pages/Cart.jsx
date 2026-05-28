import { useEffect, useMemo, useState } from 'react';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Truck,
  Loader2,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../api/apiConfig';
import { updateCartLocal, fetchCart } from '../store/cartSlice';

export default function Cart() {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e2e8f0/64748b?text=Agri+Store';

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        setSuggestLoading(true);
        const response = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Không thể tải sản phẩm gợi ý');

        const data = await response.json();
        const productArray = Array.isArray(data) ? data : data.content || [];
        const cartProductIds = new Set((items || []).map((item) => item.productId || item.id));

        const adaptedProducts = productArray
          .filter((product) => !cartProductIds.has(product.id))
          .slice(0, 4)
          .map((product) => {
            const minPrice = Number(product.minPrice || product.price || 0);
            const oldPrice = Number(product.minOldPrice || product.oldPrice || 0);
            const hasDiscount = oldPrice > minPrice;
            const calculatedDiscount = hasDiscount
              ? Math.round(((oldPrice - minPrice) / oldPrice) * 100)
              : 0;

            return {
              id: product.id,
              slug: product.slug,
              name: product.name,
              image: product.primaryImageUrl || product.image || PLACEHOLDER_IMAGE,
              price: minPrice,
              oldPrice,
              discount: calculatedDiscount,
              rating: Number(product.averageRating || 0),
              reviewCount: product.reviewCount || 0,
              categoryName: product.categoryName,
              shortDescription: product.shortDescription || '',
            };
          });

        setSuggestedProducts(adaptedProducts);
      } catch (error) {
        console.error('Lỗi tải sản phẩm gợi ý:', error);
      } finally {
        setSuggestLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, [items]);

  const totalQuantity = useMemo(() => {
    return (items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  const handleQuantityChange = async (variantId, delta, itemData) => {
    if ((itemData.quantity || 1) <= 1 && delta < 0) return;

    dispatch(updateCartLocal({ variantId, amount: delta, itemData }));

    if (user?.id) {
      try {
        await fetch(`http://localhost:8080/api/v1/cart/${user.id}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, quantity: delta }),
        });
      } catch (error) {
        console.error('Lỗi đồng bộ giỏ hàng:', error);
      }
    }
  };

  const handleRemove = async (variantId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      dispatch(updateCartLocal({ variantId, amount: -9999 }));

      if (user?.id) {
        await fetch(`http://localhost:8080/api/v1/cart/${user.id}/remove/${variantId}`, {
          method: 'DELETE',
        });
      }

      toast.success('Đã xóa sản phẩm');
    }
  };

  const renderSuggestions = () => {
    if (suggestLoading) {
      return (
        <div className="bg-white rounded-2xl border border-green-100 p-8 flex items-center justify-center text-green-700">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="font-semibold">Đang tải sản phẩm gợi ý...</span>
        </div>
      );
    }

    if (!suggestedProducts.length) return null;

    return (
      <section className="mt-8 bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-green-100 bg-green-50 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-green-800">Gợi ý mua thêm</h2>
            <p className="text-sm text-gray-600 mt-1">Một số sản phẩm phân bón, vật tư nông nghiệp phù hợp</p>
          </div>
          <Link to="/san-pham" className="text-sm font-bold text-green-700 hover:text-green-900">
            Xem thêm
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {suggestedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-[#f5f7f2] min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white max-w-md mx-auto p-8 rounded-2xl shadow-sm border border-green-100 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={38} className="text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng đang trống</h2>
            <p className="text-gray-600 mb-7 text-sm leading-6">
              Bạn chưa chọn sản phẩm nào. Hãy xem thêm phân bón và vật tư nông nghiệp cho mùa vụ.
            </p>

            <Link
              to="/danh-muc"
              className="w-full bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Tiếp tục mua hàng
            </Link>
          </div>

          {renderSuggestions()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7f2] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <Link to="/danh-muc" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 text-sm font-semibold mb-2">
              <ArrowLeft size={16} /> Tiếp tục mua hàng
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="text-sm text-gray-600 mt-1">Có {totalQuantity} sản phẩm trong giỏ hàng của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-green-50 border-b border-green-100 text-sm font-bold text-green-900 px-4 py-3">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.variantId || item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                    <div className="md:col-span-6 flex items-start gap-4">
                      <Link
                        to={`/product/${item.productId}`}
                        className="w-24 h-24 rounded-xl border border-gray-200 p-2 shrink-0 flex items-center justify-center bg-white"
                      >
                        <img
                          src={item.image || item.imageUrl || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </Link>

                      <div className="flex flex-col flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-bold text-gray-900 hover:text-green-700 line-clamp-2 text-base leading-snug"
                        >
                          {item.name}
                        </Link>
                        <span className="text-sm text-gray-500 mt-1">
                          Loại: {item.weightVolume || 'Tiêu chuẩn'}
                        </span>
                        <button
                          onClick={() => handleRemove(item.variantId || item.id)}
                          className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 mt-2 w-fit"
                        >
                          <Trash2 size={15} /> Xóa
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                      <span className="md:hidden text-gray-500 text-sm">Đơn giá:</span>
                      <span className="font-semibold text-gray-800">{(item.price || 0).toLocaleString('vi-VN')}đ</span>
                    </div>

                    <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                      <span className="md:hidden text-gray-500 text-sm">Số lượng:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-green-50 disabled:opacity-40"
                          disabled={(item.quantity || 1) <= 1}
                          onClick={() => handleQuantityChange(item.variantId || item.id, -1, item)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                        <button
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-green-50"
                          onClick={() => handleQuantityChange(item.variantId || item.id, 1, item)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                      <span className="md:hidden text-gray-500 text-sm">Thành tiền:</span>
                      <span className="font-bold text-red-600 text-lg">
                        {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>

              <div className="space-y-3 mb-5 text-sm text-gray-700">
                <div className="flex justify-between gap-4">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900 text-right">{totalAmount?.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Phí giao hàng</span>
                  <span className="font-bold text-green-700 text-right">Tính sau</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 flex gap-2 text-green-800">
                <Truck size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm leading-5">
                  Cửa hàng sẽ gọi xác nhận đơn và phí giao hàng trước khi giao.
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-5">
                <span className="font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-red-600">{totalAmount?.toLocaleString('vi-VN')}đ</span>
              </div>

              <Link
                to="/thanh-toan"
                className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition flex items-center justify-center gap-2 mb-3"
              >
                Đặt hàng <ArrowRight size={18} />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-semibold">
                <ShieldCheck size={14} className="text-green-600" /> Thông tin được bảo mật
              </div>
            </div>
          </aside>
        </div>

        {renderSuggestions()}
      </div>
    </div>
  );
}
