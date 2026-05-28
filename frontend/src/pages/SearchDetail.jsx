// src/pages/SearchDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Loader2,
  X,
  ChevronRight,
  SlidersHorizontal,
  PackageSearch,
  RotateCcw,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Link, useSearchParams } from 'react-router-dom';

const SearchDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [activeSort, setActiveSort] = useState('Mới nhất');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:8080/api/v1/products/search?query=${encodeURIComponent(query)}`);
        
        if (res.ok) {
          const data = await res.json();
          const adapted = (data || []).map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            image: product.primaryImageUrl || '/placeholder.png',
            price: Number(product.minPrice || 0),
            oldPrice: Number(product.minOldPrice || 0),
            discount: product.minOldPrice > product.minPrice 
              ? Math.round(((product.minOldPrice - product.minPrice) / product.minOldPrice) * 100) 
              : 0,
            rating: Number(product.averageRating || 0),
            reviewCount: product.reviewCount || 0,
            categoryName: product.categoryName,
            shortDescription: product.shortDescription || '',
          }));

          setAllProducts(adapted);
          setResults(adapted);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
    window.scrollTo(0, 0);
  }, [query]);

  const displayedProducts = useMemo(() => {
    let products = [...allProducts];

    const min = Number(appliedMinPrice || 0);
    const max = Number(appliedMaxPrice || 0);

    if (min > 0) {
      products = products.filter((p) => p.price >= min);
    }
    if (max > 0) {
      products = products.filter((p) => p.price <= max);
    }

    products.sort((a, b) => {
      if (activeSort === 'Giá tăng') return a.price - b.price;
      if (activeSort === 'Giá giảm') return b.price - a.price;
      if (activeSort === 'Khuyến mãi') return b.discount - a.discount;
      return 0;
    });

    return products;
  }, [allProducts, activeSort, appliedMinPrice, appliedMaxPrice]);

  const applyPriceFilter = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setActiveSort('Mới nhất');
  };

  const hasFilter = appliedMinPrice || appliedMaxPrice;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f2f5f3] text-green-700">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-bold text-lg">Đang tìm kiếm sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f2f5f3] pb-20 pt-6 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-5 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-green-700">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="font-bold text-gray-800">Tìm kiếm: "{query}"</span>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Kết quả tìm kiếm cho "{query}"
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {displayedProducts.length} sản phẩm được tìm thấy
              </p>
            </div>

            <div className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-3 rounded-xl border border-green-100 w-fit">
              <PackageSearch size={20} />
              <span className="font-bold text-sm">{displayedProducts.length} sản phẩm</span>
            </div>
          </div>

          {hasFilter && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Đang lọc:</span>
              {(appliedMinPrice || appliedMaxPrice) && (
                <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full text-xs font-bold">
                  Giá: {appliedMinPrice ? Number(appliedMinPrice).toLocaleString('vi-VN') : '0'}đ -{' '}
                  {appliedMaxPrice ? Number(appliedMaxPrice).toLocaleString('vi-VN') : 'Không giới hạn'}
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1"
              >
                <RotateCcw size={13} /> Xóa tất cả
              </button>
            </div>
          )}
        </div>

        <div className="lg:hidden flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-4 border border-green-100">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 font-bold text-gray-800 bg-green-50 px-4 py-3 rounded-xl border border-green-100"
          >
            <Filter size={18} className="text-green-700" /> Bộ lọc
          </button>

          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="border border-gray-200 bg-white rounded-xl px-3 py-3 text-sm font-bold text-gray-800 outline-none"
          >
            <option>Mới nhất</option>
            <option>Khuyến mãi</option>
            <option>Giá tăng</option>
            <option>Giá giảm</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className={`fixed inset-0 z-50 lg:static lg:z-auto bg-black/50 lg:bg-transparent transition-opacity lg:col-span-1 ${isMobileFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'}`}>
            <div className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] bg-white lg:static lg:w-full lg:max-w-none lg:bg-transparent transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="flex items-center justify-between p-4 bg-green-700 text-white lg:hidden">
                <span className="font-bold flex items-center gap-2">
                  <Filter size={18} /> Bộ lọc
                </span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 lg:p-0">
                <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 lg:sticky lg:top-24">
                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Khoảng giá</h3>
                      {(appliedMinPrice || appliedMaxPrice) && (
                        <button onClick={() => { setMinPrice(''); setMaxPrice(''); setAppliedMinPrice(''); setAppliedMaxPrice(''); }} className="text-xs font-bold text-red-500 hover:text-red-600">
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input 
                        type="number" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)} 
                        placeholder="Từ giá" 
                        className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm w-full outline-none focus:border-green-600" 
                      />
                      <input 
                        type="number" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)} 
                        placeholder="Đến giá" 
                        className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm w-full outline-none focus:border-green-600" 
                      />
                    </div>

                    <button onClick={applyPriceFilter} className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors text-sm">
                      Áp dụng giá
                    </button>
                  </div>
                </div>

                <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden w-full mt-4 bg-green-700 text-white py-3 rounded-xl font-bold">
                  Xem kết quả
                </button>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="hidden lg:flex bg-white rounded-2xl shadow-sm border border-green-100 p-4 mb-5 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <SlidersHorizontal size={18} className="text-green-700" />
                Đang hiển thị <strong className="text-gray-900">{displayedProducts.length}</strong> sản phẩm
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100 min-w-max">
                  {['Mới nhất', 'Khuyến mãi', 'Giá tăng', 'Giá giảm'].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setActiveSort(sort)}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                        activeSort === sort ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border border-green-100 shadow-sm flex flex-col items-center">
                <img src="https://cdn-icons-png.flaticon.com/512/1178/1178479.png" alt="Không có sản phẩm" className="w-24 h-24 opacity-30 mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 text-sm mb-6">Thử thay đổi từ khóa hoặc xóa bộ lọc</p>
                <button onClick={clearAllFilters} className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition shadow-sm">
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDetail;