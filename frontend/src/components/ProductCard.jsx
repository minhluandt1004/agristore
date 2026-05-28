import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { updateCartLocal } from '../store/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  if (!product) return null;

  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const hasDiscount = oldPrice > price;

  const handleAddToCart = async () => {
    const variantId = product.variantId || product.defaultVariantId || product.id;

    const itemData = {
      variantId,
      productId: product.id,
      name: product.name,
      weightVolume: product.weightVolume || product.variantName || 'Tiêu chuẩn',
      price,
      image: product.image,
    };

    dispatch(
      updateCartLocal({
        variantId,
        amount: 1,
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
            variantId,
            quantity: 1,
          }),
        });
      } catch (error) {
        console.error('Lỗi đồng bộ giỏ hàng:', error);
      }
    }

    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md transition duration-300 flex flex-col h-full">
      <Link
        to={`/product/${product.slug || product.id}`}
        className="block relative overflow-hidden aspect-square bg-[#f7faf6] border-b border-gray-100"
      >
        <img
          src={product.image || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition duration-300"
        />

        {Number(product.discount) > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            -{product.discount}%
          </div>
        )}
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-1">
        {product.categoryName && (
          <p className="text-xs font-semibold text-green-700 mb-1 line-clamp-1">
            {product.categoryName}
          </p>
        )}

        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-bold text-sm md:text-[15px] text-gray-900 line-clamp-2 min-h-[40px] hover:text-green-700 transition leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-700">{Number(product.rating || 0).toFixed(1)}</span>
          <span>({product.reviewCount || 0} đánh giá)</span>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed min-h-[32px]">
          {product.shortDescription || 'Sản phẩm nông nghiệp chất lượng, hỗ trợ chăm sóc cây trồng hiệu quả.'}
        </p>

        <div className="mt-auto pt-3">
          <div className="mb-3 min-h-[24px] flex items-center gap-2 flex-wrap">
            <span className="text-base md:text-lg font-bold text-red-600 leading-none">
              {price.toLocaleString('vi-VN')}đ
            </span>

            {hasDiscount ? (
              <span className="text-xs text-gray-400 line-through font-medium leading-none">
                {oldPrice.toLocaleString('vi-VN')}đ
              </span>
            ) : (
              <span className="text-xs text-transparent leading-none select-none">0đ</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingCart size={16} /> Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
