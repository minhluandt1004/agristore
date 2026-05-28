import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  SlidersHorizontal,
  PackageSearch,
  RotateCcw,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Link, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../api/apiConfig';

export default function Category() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategories = searchParams.get('category');

  const [activeSort, setActiveSort] = useState('Mới nhất');
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState([]);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');

  const checkedSlugs = useMemo(() => {
    return urlCategories ? urlCategories.split(',').filter(Boolean) : [];
  }, [urlCategories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const catRes = await fetch('http://localhost:8080/api/v1/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        const prodRes = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const productArray = Array.isArray(prodData) ? prodData : prodData.content || [];

          const adaptedProducts = productArray.map((product) => {
            const minPriceValue = Number(product.minPrice || product.price || 0);
            const oldPrice = Number(product.minOldPrice || product.oldPrice || 0);
            const hasDiscount = oldPrice > minPriceValue;

            return {
              id: product.id,
              slug: product.slug,
              name: product.name,
              image:
                product.primaryImageUrl ||
                product.image ||
                'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
              price: minPriceValue,
              oldPrice,
              discount: hasDiscount ? Math.round(((oldPrice - minPriceValue) / oldPrice) * 100) : 0,
              rating: Number(product.averageRating || 0),
              reviewCount: product.reviewCount || 0,
              categorySlug: product.categorySlug,
              categoryName: product.categoryName,
              shortDescription: product.shortDescription || '',
            };
          });

          setAllProducts(adaptedProducts);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (categories.length > 0 && checkedSlugs.length > 0) {
      checkedSlugs.forEach((slug) => {
        const parent = categories.find(
          (p) => p.slug === slug || p.children?.some((c) => c.slug === slug)
        );

        if (parent && !expandedParents.includes(parent.id)) {
          setExpandedParents((prev) => [...prev, parent.id]);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategories, categories]);

  const updateUrl = (newCheckedSlugs) => {
    if (newCheckedSlugs.length > 0) {
      setSearchParams({ category: newCheckedSlugs.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const toggleParent = (rootCat) => {
    let newChecked;

    if (checkedSlugs.includes(rootCat.slug)) {
      newChecked = checkedSlugs.filter(
        (s) => s !== rootCat.slug && !rootCat.children?.some((c) => c.slug === s)
      );
    } else {
      newChecked = [
        ...checkedSlugs.filter((s) => !rootCat.children?.some((c) => c.slug === s)),
        rootCat.slug,
      ];
    }

    updateUrl(newChecked);
  };

  const toggleChild = (childSlug, rootCat) => {
    let newChecked;
    const isParentChecked = checkedSlugs.includes(rootCat.slug);

    if (isParentChecked) {
      newChecked = checkedSlugs.filter((s) => s !== rootCat.slug).concat(childSlug);
    } else {
      newChecked = checkedSlugs.includes(childSlug)
        ? checkedSlugs.filter((s) => s !== childSlug)
        : [...checkedSlugs, childSlug];
    }

    updateUrl(newChecked);
  };

  const toggleAccordion = (categoryId) => {
    setExpandedParents((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const getSelectedCategoryNames = () => {
    const names = [];

    checkedSlugs.forEach((slug) => {
      const parent = categories.find((cat) => cat.slug === slug);

      if (parent) {
        names.push(parent.name);
        return;
      }

      categories.forEach((root) => {
        const child = root.children?.find((c) => c.slug === slug);
        if (child) names.push(child.name);
      });
    });

    return names;
  };

  const applyPriceFilter = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setActiveSort('Mới nhất');
  };

  const displayedProducts = useMemo(() => {
    let products = [...allProducts];

    if (checkedSlugs.length > 0) {
      const validNames = [];
      const validSlugs = [];

      checkedSlugs.forEach((cSlug) => {
        validSlugs.push(cSlug);
        const parentCat = categories.find((c) => c.slug === cSlug);

        if (parentCat) {
          validNames.push(parentCat.name);
          if (parentCat.children) {
            parentCat.children.forEach((child) => {
              validNames.push(child.name);
              validSlugs.push(child.slug);
            });
          }
        } else {
          categories.forEach((root) => {
            const childCat = root.children?.find((c) => c.slug === cSlug);
            if (childCat) validNames.push(childCat.name);
          });
        }
      });

      const safeNames = validNames.map((n) => n?.toLowerCase().trim());

      products = products.filter((p) => {
        const matchName = safeNames.includes(p.categoryName?.toLowerCase().trim());
        const matchSlug = validSlugs.includes(p.categorySlug);
        return matchName || matchSlug;
      });
    }

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
  }, [allProducts, checkedSlugs, categories, activeSort, appliedMinPrice, appliedMaxPrice]);

  const selectedCategoryNames = getSelectedCategoryNames();
  const hasFilter = checkedSlugs.length > 0 || appliedMinPrice || appliedMaxPrice;

  const FilterContent = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 lg:sticky lg:top-24">
      <div className="hidden lg:flex items-center gap-2 font-bold text-green-800 mb-5 pb-4 border-b border-gray-100">
        <Filter size={20} className="text-green-700" /> Bộ lọc sản phẩm
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Danh mục</h3>
          {checkedSlugs.length > 0 && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
              Xóa
            </button>
          )}
        </div>

        <button
          onClick={() => setSearchParams({})}
          className={`w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 mb-3 border transition ${
            checkedSlugs.length === 0
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-white border-gray-100 text-gray-800 hover:border-green-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
              checkedSlugs.length === 0 ? 'border-green-600 bg-green-600' : 'border-gray-300'
            }`}
          >
            {checkedSlugs.length === 0 && <Check size={14} className="text-white" />}
          </div>
          <span className="font-bold">Tất cả sản phẩm</span>
        </button>

        <div className="space-y-2">
          {categories.map((rootCat) => {
            const isExpanded = expandedParents.includes(rootCat.id);
            const isRootChecked = checkedSlugs.includes(rootCat.slug);
            const hasChildren = rootCat.children && rootCat.children.length > 0;

            return (
              <div key={rootCat.id} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center bg-white hover:bg-green-50 transition">
                  <button
                    onClick={() => toggleParent(rootCat)}
                    className="pl-3 pr-2 py-3"
                    aria-label={`Chọn ${rootCat.name}`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isRootChecked ? 'border-green-600 bg-green-600' : 'border-gray-300'
                      }`}
                    >
                      {isRootChecked && <Check size={14} className="text-white" />}
                    </div>
                  </button>

                  <button
                    onClick={() => (hasChildren ? toggleAccordion(rootCat.id) : toggleParent(rootCat))}
                    className={`flex-1 text-left py-3 text-sm font-bold ${
                      isRootChecked ? 'text-green-800' : 'text-gray-800'
                    }`}
                  >
                    {rootCat.name}
                  </button>

                  {hasChildren && (
                    <button
                      onClick={() => toggleAccordion(rootCat.id)}
                      className="p-3 text-gray-500 hover:text-green-700"
                      aria-label="Mở danh mục con"
                    >
                      <ChevronDown
                        size={18}
                        className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="bg-gray-50 px-3 py-3 space-y-2 border-t border-gray-100">
                    {rootCat.children.map((child) => {
                      const isChildChecked = checkedSlugs.includes(child.slug) || isRootChecked;

                      return (
                        <button
                          key={child.id}
                          onClick={() => toggleChild(child.slug, rootCat)}
                          className={`w-full flex items-center gap-3 text-left rounded-lg px-3 py-2 transition ${
                            isChildChecked ? 'bg-white text-green-800' : 'text-gray-600 hover:bg-white'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isChildChecked ? 'border-green-600 bg-green-600' : 'border-gray-300'
                            }`}
                          >
                            {isChildChecked && <Check size={11} className="text-white" />}
                          </div>
                          <span className="text-sm font-semibold">{child.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Khoảng giá</h3>
          {(appliedMinPrice || appliedMaxPrice) && (
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setAppliedMinPrice('');
                setAppliedMaxPrice('');
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
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
            className="border border-gray-200 rounded-xl px-3 py-3 text-sm w-full outline-none focus:border-green-600 bg-white text-gray-900"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Đến giá"
            className="border border-gray-200 rounded-xl px-3 py-3 text-sm w-full outline-none focus:border-green-600 bg-white text-gray-900"
          />
        </div>

        <button
          onClick={applyPriceFilter}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors text-sm"
        >
          Áp dụng giá
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f2f5f3] text-green-700">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-bold text-lg">Đang tải kệ hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f2f5f3] pb-20 pt-6 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-5 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-green-700">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <Link
            to="/danh-muc"
            onClick={() => setSearchParams({})}
            className={`hover:text-green-700 ${checkedSlugs.length === 0 ? 'font-bold text-gray-800' : ''}`}
          >
            Danh mục sản phẩm
          </Link>
          {checkedSlugs.length > 0 && (
            <>
              <ChevronRight size={14} />
              <span className="font-bold text-gray-800">Đang lọc</span>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
              <p className="text-sm text-gray-600 mt-1">
                Chọn nhanh phân bón, thuốc BVTV và vật tư nông nghiệp phù hợp.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-3 rounded-xl border border-green-100 w-fit">
              <PackageSearch size={20} />
              <span className="font-bold text-sm">{displayedProducts.length} sản phẩm</span>
            </div>
          </div>

          {hasFilter && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Đang chọn:</span>

              {selectedCategoryNames.map((name) => (
                <span key={name} className="bg-green-50 text-green-800 border border-green-100 px-3 py-1.5 rounded-full text-xs font-bold">
                  {name}
                </span>
              ))}

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
          <aside
            className={`fixed inset-0 z-50 lg:static lg:z-auto bg-black/50 lg:bg-transparent transition-opacity lg:col-span-1 ${
              isMobileFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible lg:opacity-100 lg:visible'
            }`}
          >
            <div
              className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] bg-white lg:static lg:w-full lg:max-w-none lg:bg-transparent transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
                isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between p-4 bg-green-700 text-white lg:hidden">
                <span className="font-bold flex items-center gap-2">
                  <Filter size={18} /> Bộ lọc sản phẩm
                </span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 lg:p-0">
                <FilterContent />

                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="lg:hidden w-full mt-4 bg-green-700 text-white py-3 rounded-xl font-bold"
                >
                  Xem sản phẩm
                </button>
              </div>
            </div>

            <button
              className="lg:hidden absolute inset-0 z-[-1]"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Đóng bộ lọc"
            />
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
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1178/1178479.png"
                  alt="Không có sản phẩm"
                  className="w-24 h-24 opacity-30 mb-4"
                />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có sản phẩm phù hợp</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn thử chọn danh mục khác hoặc xóa bộ lọc hiện tại.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-green-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-800 transition shadow-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
