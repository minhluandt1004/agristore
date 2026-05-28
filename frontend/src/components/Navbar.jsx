import { useEffect, useState } from 'react';
import { clearCart } from '../store/cartSlice';
import SearchBar from './SearchBar';
import {
  Search,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Grid,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  Lock,
  LogOut,
  Flame,
  Gift,
  Leaf,
  Sprout,
  Star,
  Flower2,
  Beaker,
  Bug,
  Droplets,
  Trees,
  Shield,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalAmount } = useSelector((state) => state.cart);
  const user = JSON.parse(localStorage.getItem('user'));

  const [keyword, setKeyword] = useState('');


  const cartQuantity = items.length;

  const [categories, setCategories] = useState([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
        if (data?.length > 0) {
          setActiveCategory(data[0]);
        }
      })
      .catch((err) => console.log('Lỗi tải danh mục:', err));
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

    const checkExpire = () => {
      const lastActive = localStorage.getItem('lastActive');
      const now = Date.now();

      if (lastActive && now - parseInt(lastActive) > ONE_WEEK) {
        dispatch(clearCart());

        localStorage.removeItem('user');
        localStorage.removeItem('lastActive');

        alert('Phiên đăng nhập đã hết hạn');

        navigate('/dang-nhap');
        window.location.reload();
      }
    };

    checkExpire();

    let timeout;

    const updateLastActive = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        localStorage.setItem('lastActive', Date.now().toString());
      }, 1000);
    };

    window.addEventListener('click', updateLastActive);
    window.addEventListener('keydown', updateLastActive);
    window.addEventListener('scroll', updateLastActive);

    return () => {
      clearTimeout(timeout);

      window.removeEventListener('click', updateLastActive);
      window.removeEventListener('keydown', updateLastActive);
      window.removeEventListener('scroll', updateLastActive);
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    const handleStorageChange = () => {
      const latestUser = JSON.parse(localStorage.getItem('user'));

      if (latestUser?.id) {
        dispatch(fetchCart(latestUser.id));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-login', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleStorageChange);
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(clearCart());  // xóa giỏ hàng
    localStorage.removeItem('user'); // xóa user
    navigate('/dang-nhap');
    window.location.reload();
  }

  const getCategoryIcon = (name = '') => {
    const lower = name.toLowerCase();

    if (lower.includes('bán chạy')) return <Star size={20} />;
    if (lower.includes('chậu')) return <Flower2 size={20} />;
    if (lower.includes('phân')) return <Beaker size={20} />;
    if (lower.includes('thuốc')) return <Shield size={20} />;
    if (lower.includes('sâu')) return <Bug size={20} />;
    if (lower.includes('thủy') || lower.includes('nước')) return <Droplets size={20} />;
    if (lower.includes('hạt') || lower.includes('giống')) return <Sprout size={20} />;
    if (lower.includes('kiểng') || lower.includes('hoa')) return <Leaf size={20} />;

    return <Trees size={20} />;
  };

  const quickMenus = [
    {
      title: 'Sản phẩm bán chạy',
      desc: 'Được nhiều nhà vườn lựa chọn',
      icon: <Flame size={20} />,
      to: '/danh-muc?sort=best-selling',
      badge: 'HOT',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      badgeColor: 'bg-red-500',
    },
    {
      title: 'Khuyến mãi hôm nay',
      desc: 'Ưu đãi tốt trong ngày',
      icon: <Gift size={20} />,
      to: '/danh-muc?promotion=true',
      badge: 'SALE',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      badgeColor: 'bg-orange-500',
    },
    {
      title: 'Hàng mới về',
      desc: 'Sản phẩm mới cập nhật',
      icon: <Leaf size={20} />,
      to: '/danh-muc?sort=newest',
      badge: 'NEW',
      color: 'text-green-600',
      bg: 'bg-green-50',
      badgeColor: 'bg-green-500',
    },
  ];

  const activeChildren = activeCategory?.children || [];

  const closeAllMenus = () => {
    setShowMegaMenu(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-[#064e3b] text-white py-1.5 text-[11px] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5 text-emerald-100 italic">
              <Phone size={13} />
              Hỗ trợ kỹ thuật:
              <strong>0863 999 086</strong>
            </span>

            <span className="flex items-center gap-1.5 text-emerald-100">
              <MapPin size={13} />
              Đại lý phân phối vật tư toàn quốc
            </span>
          </div>

          <div className="flex gap-5 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-yellow-400" />
              100% Chính hãng
            </span>

            <span className="flex items-center gap-1">
              <Truck size={14} className="text-yellow-400" />
              Giao hàng tận vườn
            </span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 md:gap-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl md:text-2xl font-black text-[#064e3b] shrink-0"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-md">
            🌿
          </div>

          <div className="leading-tight hidden sm:block">
            <span className="block tracking-tight">AGRI STORE</span>
            <span className="text-[9px] text-emerald-600 font-bold tracking-widest uppercase">
              Vật Tư Nông Nghiệp
            </span>
          </div>
        </Link>

        <div className="flex-1 max-w-2xl relative hidden md:block ml-6 md:ml-10">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          {!user ? (
            <Link
              to="/dang-nhap"
              className="flex items-center gap-2 cursor-pointer hover:text-[#047857] transition group"
            >
              <div className="bg-gray-100 p-2 rounded-full group-hover:bg-emerald-50 text-gray-600 group-hover:text-emerald-600">
                <User size={22} />
              </div>

              <div className="hidden lg:block text-sm">
                <p className="text-gray-500 text-[10px] uppercase font-bold">
                  Thành viên
                </p>
                <p className="font-bold text-gray-800 leading-none mt-0.5">
                  Đăng nhập
                </p>
              </div>
            </Link>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="bg-emerald-50 p-2 rounded-full text-emerald-700">
                  <User size={22} />
                </div>

                <div className="hidden lg:block text-sm">
                  <p className="text-gray-500 text-[10px] uppercase font-bold">
                    Xin chào
                  </p>
                  <p className="font-bold text-gray-800 leading-none mt-0.5">
                    {user.fullName || user.name || 'Khách hàng'}
                  </p>
                </div>
              </div>

              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                              z-50 overflow-hidden">
                <div className="p-5 bg-[#064e3b] text-white">
                  <p className="font-bold text-lg">{user.fullName || user.name || 'Khách hàng'}</p>
                  <p className="text-xs text-emerald-200 mt-1">{user.phone || user.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/tai-khoan"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-gray-700 hover:text-emerald-700 transition"
                  >
                    <User size={18} />
                    Thông tin cá nhân
                  </Link>

                  <Link
                    to="/tai-khoan?tab=password"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-gray-700 hover:text-emerald-700 transition"
                  >
                    <Lock size={18} />
                    Đổi mật khẩu
                  </Link>

                  <Link
                    to="/tai-khoan?tab=orders"
                    onClick={closeAllMenus}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-gray-700 hover:text-emerald-700 transition"
                  >
                    <Package size={18} />
                    Đơn hàng của tôi
                  </Link>

                  <hr className="my-2" />

                  <button
                    onClick={() => {
                      handleLogout();
                      closeAllMenus();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-500 transition"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}

          <Link
            to="/gio-hang"
            className="flex items-center gap-2 cursor-pointer hover:text-[#047857] transition group"
          >
            <div className="relative bg-gray-100 p-2 rounded-full group-hover:bg-emerald-50 text-gray-600 group-hover:text-emerald-600">
              <ShoppingCart size={22} />

              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                  {cartQuantity > 99 ? '99+' : cartQuantity}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-sm">
              <p className="text-gray-500 text-[10px] uppercase font-bold">
                Giỏ hàng
              </p>
              <p className="font-bold text-orange-600 leading-none mt-0.5">
                {totalAmount > 0
                  ? `${totalAmount.toLocaleString('vi-VN')}đ`
                  : 'Trống'}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* NAV BAR + MEGA MENU */}
      <div className="border-t border-gray-100 hidden md:block bg-white relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8">
          {/* CATEGORY BUTTON */}
          <div
            className="relative"
            onMouseEnter={() => {
              setShowMegaMenu(true);
              if (!activeCategory && categories.length > 0) {
                setActiveCategory(categories[0]);
              }
            }}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <button
              type="button"
              className="bg-[#047857] hover:bg-[#064e3b] transition text-white px-6 py-3 flex items-center gap-2 cursor-pointer font-bold min-w-[285px] rounded-t-xl mt-1 shadow-inner"
            >
              <Grid size={18} />
              DANH MỤC VẬT TƯ
              <ChevronDown
                size={16}
                className={`ml-auto transition ${showMegaMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showMegaMenu && (
              <div className="absolute left-0 top-full z-[999] w-[1180px] bg-white rounded-b-3xl rounded-tr-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-12 min-h-[520px]">
                  {/* LEFT MENU */}
                  <div className="col-span-3 border-r border-gray-100 bg-white">
                    <div className="p-4 space-y-2 border-b border-gray-100">
                      {quickMenus.map((item) => (
                        <Link
                          key={item.title}
                          to={item.to}
                          onClick={closeAllMenus}
                          className={`flex items-center gap-3 px-3 py-3 rounded-2xl ${item.bg} hover:scale-[1.02] transition`}
                        >
                          <div className={`${item.color}`}>
                            {item.icon}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-black text-gray-800">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {item.desc}
                            </p>
                          </div>

                          <span className={`${item.badgeColor} text-white text-[10px] font-black px-2 py-1 rounded-full`}>
                            {item.badge}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="py-2 max-h-[360px] overflow-y-auto">
                      {categories.map((cat) => {
                        const isActive = activeCategory?.id === cat.id;
                        const hasChildren = cat.children && cat.children.length > 0;

                        return (
                          <Link
                            key={cat.id}
                            to={`/danh-muc?category=${cat.slug}`}
                            onMouseEnter={() => setActiveCategory(cat)}
                            onClick={closeAllMenus}
                            className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition relative ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'
                            }`}
                          >
                            <span className={`${isActive ? 'text-emerald-700' : 'text-emerald-600'}`}>
                              {getCategoryIcon(cat.name)}
                            </span>

                            <span className="flex-1 line-clamp-1">
                              {cat.name}
                            </span>

                            {hasChildren && (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}

                            {isActive && (
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-l-full"></span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT PANEL */}
                  <div className="col-span-9 bg-gradient-to-br from-white to-emerald-50/30 p-8">
                    {activeCategory ? (
                      <>
                        <div className="flex items-center gap-5 mb-7 pb-6 border-b border-gray-100">
                          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            {getCategoryIcon(activeCategory.name)}
                          </div>

                          <div>
                            <Link
                              to={`/danh-muc?category=${activeCategory.slug}`}
                              onClick={closeAllMenus}
                              className="text-2xl font-black text-emerald-800 hover:text-orange-500 transition"
                            >
                              {activeCategory.name}
                            </Link>

                            <p className="text-sm text-gray-500 mt-1">
                              Xem sản phẩm thuộc nhóm {activeCategory.name}
                            </p>
                          </div>

                          <Link
                            to={`/danh-muc?category=${activeCategory.slug}`}
                            onClick={closeAllMenus}
                            className="ml-auto bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl font-bold text-sm transition"
                          >
                            Xem tất cả →
                          </Link>
                        </div>

                        {activeChildren.length > 0 ? (
                          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                            {activeChildren.map((child) => (
                              <Link
                                key={child.id}
                                to={`/danh-muc?category=${child.slug}`}
                                onClick={closeAllMenus}
                                className="group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-md transition border border-transparent hover:border-emerald-100"
                              >
                                <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition">
                                  {getCategoryIcon(child.name)}
                                </div>

                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-1">
                                    {child.name}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Xem sản phẩm
                                  </p>
                                </div>

                                <ChevronRight
                                  size={15}
                                  className="text-gray-300 group-hover:text-emerald-600"
                                />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="h-[300px] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                              {getCategoryIcon(activeCategory.name)}
                            </div>

                            <h3 className="text-xl font-black text-gray-800">
                              {activeCategory.name}
                            </h3>

                            <p className="text-gray-500 text-sm mt-2 max-w-md">
                              Danh mục này chưa có nhóm con. Bạn có thể xem toàn bộ sản phẩm trong danh mục.
                            </p>

                            <Link
                              to={`/danh-muc?category=${activeCategory.slug}`}
                              className="mt-5 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition"
                            >
                              Xem sản phẩm
                            </Link>
                          </div>
                        )}

                        <div className="mt-8 grid grid-cols-3 gap-4">
                          <Link
                            to="/danh-muc?sort=best-selling"
                            onClick={closeAllMenus}
                            className="rounded-3xl bg-orange-50 border border-orange-100 p-5 hover:shadow-md transition"
                          >
                            <p className="text-orange-600 font-black text-lg">
                              Bán chạy
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Sản phẩm được mua nhiều
                            </p>
                          </Link>

                          <Link
                            to="/danh-muc?promotion=true"
                            onClick={closeAllMenus}
                            className="rounded-3xl bg-red-50 border border-red-100 p-5 hover:shadow-md transition"
                          >
                            <p className="text-red-600 font-black text-lg">
                              Ưu đãi
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Chương trình khuyến mãi
                            </p>
                          </Link>

                          <Link
                            to="/danh-muc?sort=newest"
                            onClick={closeAllMenus}
                            className="rounded-3xl bg-green-50 border border-green-100 p-5 hover:shadow-md transition"
                          >
                            <p className="text-green-700 font-black text-lg">
                              Hàng mới
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Vừa cập nhật tại cửa hàng
                            </p>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Đang tải danh mục...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="flex gap-10 font-bold text-[13px] text-gray-700 uppercase tracking-wide">
            <Link
              to="/"
              className="py-3 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-700 transition-all"
            >
              Trang chủ
            </Link>

            <Link
              to="/danh-muc"
              className="py-3 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-700 transition-all flex items-center gap-1"
            >
              Sản phẩm
            </Link>

            <Link
              to="/tin-tuc"
              className="py-3 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-700 transition-all"
            >
              Tin tức & Kỹ thuật
            </Link>

            <Link
              to="/video"
              className="py-3 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-700 transition-all"
            >
              Video hướng dẫn
            </Link>
          </nav>

          <a
            href="tel:0863999086"
            className="ml-auto flex items-center gap-2 text-[#047857] font-black italic"
          >
            <Phone size={16} />
            0863.999.086
          </a>
        </div>
      </div>
    </header>
  );
}