import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/products/search?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
        setActiveIndex(-1);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/tim-kiem?query=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const highlight = (text) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200 font-medium">$1</span>');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className={`flex items-center bg-white border-2 rounded-3xl overflow-hidden transition-all duration-200 shadow-sm h-10
        ${isFocused ? 'border-emerald-600 shadow-md ring-2 ring-emerald-100' : 'border-gray-200 hover:border-emerald-300'}`}
      >
        <div className="pl-4 text-gray-400">
          <Search size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setIsFocused(true); if (query) setShowDropdown(true); }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit();
          }}
          placeholder="Tìm phân bón, thuốc BTVT, vật tư nông nghiệp..."
          className="flex-1 px-3 py-0 bg-transparent text-[15px] outline-none placeholder:text-gray-400 h-full"
        />

        {query && (
          <button onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition mr-1">
            <X size={18} strokeWidth={3} />
          </button>
        )}

        <button 
          onClick={handleSearchSubmit}
          className="bg-emerald-700 hover:bg-emerald-800 h-8 w-8 flex items-center justify-center text-white transition-all active:scale-95 mr-1.5 rounded-2xl"
        >
          <Search size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Dropdown giữ nguyên như cũ */}
      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto">
          {/* ... phần dropdown giữ nguyên như code bạn gửi ... */}
          {loading && <p className="p-6 text-center text-gray-500">Đang tìm kiếm...</p>}
          
          {!loading && results.length === 0 && (
            <p className="p-6 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
          )}

          {!loading && results.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-emerald-50 transition-all border-b last:border-none
                ${index === activeIndex ? 'bg-emerald-50' : ''}`}
              onClick={() => {
                setShowDropdown(false);
                setQuery('');
              }}
            >
              <img
                src={product.primaryImageUrl || '/placeholder.png'}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-2xl border border-gray-100 flex-shrink-0"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 line-clamp-2 text-[15px]"
                   dangerouslySetInnerHTML={{ __html: highlight(product.name) }} />

                <p className="text-sm text-emerald-700 mt-1 font-medium">
                  {product.categoryName}
                </p>

                {product.shortDescription && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.shortDescription}
                  </p>
                )}

                {product.averageRating && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-600">{product.averageRating}</span>
                    <span className="text-xs text-gray-400">({product.reviewCount})</span>
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                {product.minOldPrice && product.minOldPrice > product.minPrice ? (
                  <>
                    <p className="text-xs text-gray-400 line-through">
                      {product.minOldPrice.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="font-bold text-lg text-emerald-700">
                      {product.minPrice.toLocaleString('vi-VN')}đ
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-lg text-emerald-700">
                    {product.minPrice?.toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;