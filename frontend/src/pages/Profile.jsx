import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  LogOut,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ShoppingBag,
  X,
  Package,
  CreditCard,
  Truck,
  CalendarDays,
  ReceiptText,
} from 'lucide-react';

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'info';

  const [user, setUser] = useState({
    id: null,
    fullName: '',
    phone: '',
    email: '',
  });

  const [originalUser, setOriginalUser] = useState({});
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');

  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    id: null,
    receiverName: '',
    receiverPhone: '',
    province: { code: '', name: '' },
    district: { code: '', name: '' },
    ward: { code: '', name: '' },
    specificAddress: '',
    isDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    cf: false,
  });

  const orderStatusTabs = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPING', label: 'Đang giao' },
    { value: 'COMPLETED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filteredOrders =
    orderFilter === 'ALL'
      ? orders
      : orders.filter((order) => order.orderStatus === orderFilter);

  const inputClass =
    'w-full border border-gray-200 rounded-xl p-3 bg-white outline-none focus:border-green-600 transition text-sm';

  const buttonPrimary =
    'bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold transition active:scale-95';

  const buttonSecondary =
    'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition';

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (value) => {
    if (!value) return 'Đang cập nhật';

    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'Đang cập nhật';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'UNPAID':
        return 'Chưa thanh toán';
      case 'PAID':
        return 'Đã thanh toán';
      default:
        return status || 'Đang cập nhật';
    }
  };

  const getTotalQuantity = (items = []) => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-600';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-600';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-600';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  const getErrorMessage = async (response) => {
    try {
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.message || 'Có lỗi xảy ra';
      }

      return await response.text();
    } catch {
      return 'Không thể kết nối server';
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setOriginalUser(parsed);

      if (parsed.id) {
        fetchAddresses(parsed.id);
        fetchOrders(parsed.id);
      }
    }

    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then(setProvinces);
  }, []);

  const fetchAddresses = async (userId) => {
    const res = await fetch(
      `http://localhost:8080/api/v1/users/${userId}/addresses`
    );

    if (res.ok) {
      setAddresses(await res.json());
    }
  };

  const fetchOrders = async (userId) => {
    setIsLoadingOrders(true);

    try {
      const res = await fetch(`http://localhost:8080/api/v1/orders/user/${userId}`);

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error('Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi tải đơn hàng');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setShowAddressForm(false);
  };

  const handleUpdateInfo = async () => {
    if (!user.fullName.trim()) {
      return toast.error('Vui lòng nhập họ tên');
    }

    const loading = toast.loading('Đang cập nhật...');

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/users/${user.id}/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: user.fullName,
            email: user.email,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();

        setUser(updated);
        setOriginalUser(updated);

        localStorage.setItem('user', JSON.stringify(updated));

        setIsEditingInfo(false);

        toast.success('Đã cập nhật hồ sơ', {
          id: loading,
        });
      } else {
        toast.error(await getErrorMessage(res), {
          id: loading,
        });
      }
    } catch {
      toast.error('Lỗi kết nối server', {
        id: loading,
      });
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    const loading = toast.loading('Đang lưu địa chỉ...');

    const fullAddress = `${addressForm.specificAddress}, ${addressForm.ward.name}, ${addressForm.district.name}, ${addressForm.province.name}`;

    const url = isEditingAddress
      ? `http://localhost:8080/api/v1/users/${user.id}/addresses/${addressForm.id}`
      : `http://localhost:8080/api/v1/users/${user.id}/addresses`;

    const res = await fetch(url, {
      method: isEditingAddress ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...addressForm,
        fullAddress,
      }),
    });

    if (res.ok) {
      toast.success(
        isEditingAddress ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ',
        {
          id: loading,
        }
      );

      setShowAddressForm(false);
      fetchAddresses(user.id);
    } else {
      toast.error(await getErrorMessage(res), {
        id: loading,
      });
    }
  };

  const handleDeleteAddress = async (id) => {
    const loading = toast.loading('Đang xóa...');

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/users/addresses/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        toast.success('Đã xóa địa chỉ', {
          id: loading,
        });

        fetchAddresses(user.id);
      } else {
        toast.error('Không thể xóa', {
          id: loading,
        });
      }
    } catch {
      toast.error('Lỗi kết nối server', {
        id: loading,
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Mật khẩu mới không khớp');
    }

    const loading = toast.loading('Đang cập nhật mật khẩu...');

    const res = await fetch(
      `http://localhost:8080/api/v1/users/${user.id}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      }
    );

    if (res.ok) {
      toast.success('Đổi mật khẩu thành công', {
        id: loading,
      });

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast.error(await getErrorMessage(res), {
        id: loading,
      });
    }
  };

  const onProvinceChange = (e) => {
    const p = provinces.find((x) => x.code == e.target.value);

    setAddressForm({
      ...addressForm,
      province: {
        code: p.code,
        name: p.name,
      },
      district: {
        code: '',
        name: '',
      },
      ward: {
        code: '',
        name: '',
      },
    });

    fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
      .then((res) => res.json())
      .then((d) => setDistricts(d.districts));
  };

  const onDistrictChange = (e) => {
    const d = districts.find((x) => x.code == e.target.value);

    setAddressForm({
      ...addressForm,
      district: {
        code: d.code,
        name: d.name,
      },
      ward: {
        code: '',
        name: '',
      },
    });

    fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards));
  };

  return (
    <div className="bg-[#f5f7f5] min-h-screen py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-5">
        <aside className="md:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden sticky top-24 shadow-sm">
            <div className="bg-green-700 p-6 text-white text-center">
              <div className="w-14 h-14 rounded-full bg-white text-green-700 flex items-center justify-center text-xl font-black mx-auto mb-3 uppercase">
                {user.fullName?.charAt(0) || 'U'}
              </div>

              <p className="font-bold text-sm truncate">
                {user.fullName || 'Khách hàng'}
              </p>
            </div>

            <div className="p-3 space-y-1">
              <button
                onClick={() => handleTabChange('info')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'info'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User size={18} />
                Hồ sơ cá nhân
              </button>

              <button
                onClick={() => handleTabChange('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'addresses'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MapPin size={18} />
                Sổ địa chỉ
              </button>

              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'orders'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag size={18} />
                Đơn hàng của bạn
              </button>

              <button
                onClick={() => handleTabChange('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'password'
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Lock size={18} />
                Đổi mật khẩu
              </button>

              <hr className="my-2" />

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/dang-nhap';
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8 min-h-[600px]">
          {activeTab === 'info' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-800">
                  Thông tin tài khoản
                </h2>

                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold hover:bg-green-100 transition"
                  >
                    <Edit3 size={16} />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    Họ và tên
                  </label>

                  <input
                    type="text"
                    value={user.fullName}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        fullName: e.target.value,
                      })
                    }
                    disabled={!isEditingInfo}
                    className={`${inputClass} ${
                      !isEditingInfo ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Số điện thoại
                    </label>

                    <input
                      value={user.phone}
                      disabled
                      className={`${inputClass} bg-gray-50 text-gray-500`}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          email: e.target.value,
                        })
                      }
                      disabled={!isEditingInfo}
                      className={`${inputClass} ${
                        !isEditingInfo ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                    />
                  </div>
                </div>

                {isEditingInfo && (
                  <div className="flex flex-wrap gap-3 pt-4">
                    <button onClick={handleUpdateInfo} className={buttonPrimary}>
                      Lưu thay đổi
                    </button>

                    <button
                      onClick={() => {
                        setUser(originalUser);
                        setIsEditingInfo(false);
                      }}
                      className={buttonSecondary}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className="flex flex-wrap gap-3 items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-800">
                  Sổ địa chỉ
                </h2>

                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setIsEditingAddress(false);

                      setAddressForm({
                        id: null,
                        receiverName: '',
                        receiverPhone: '',
                        province: { code: '', name: '' },
                        district: { code: '', name: '' },
                        ward: { code: '', name: '' },
                        specificAddress: '',
                        isDefault: false,
                      });

                      setShowAddressForm(true);
                    }}
                    className={buttonPrimary}
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={18} />
                      Thêm địa chỉ
                    </span>
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form
                  onSubmit={handleAddressSubmit}
                  className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Tên người nhận"
                      value={addressForm.receiverName}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          receiverName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />

                    <input
                      required
                      placeholder="Số điện thoại"
                      value={addressForm.receiverPhone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          receiverPhone: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <select
                      required
                      value={addressForm.province.code}
                      onChange={onProvinceChange}
                      className={inputClass}
                    >
                      <option value="">Tỉnh / Thành</option>

                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      required
                      value={addressForm.district.code}
                      onChange={onDistrictChange}
                      disabled={!addressForm.province.code}
                      className={inputClass}
                    >
                      <option value="">Quận / Huyện</option>

                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>

                    <select
                      required
                      value={addressForm.ward.code}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          ward: {
                            code: e.target.value,
                            name:
                              wards.find((w) => w.code == e.target.value)
                                ?.name || '',
                          },
                        })
                      }
                      disabled={!addressForm.district.code}
                      className={inputClass}
                    >
                      <option value="">Phường / Xã</option>

                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    required
                    placeholder="Địa chỉ chi tiết"
                    value={addressForm.specificAddress}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        specificAddress: e.target.value,
                      })
                    }
                    className={inputClass}
                  />

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    Đặt làm địa chỉ mặc định
                  </label>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" className={buttonPrimary}>
                      Lưu địa chỉ
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className={buttonSecondary}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl border p-5 transition ${
                        addr.isDefault
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">
                              {addr.receiverName}
                            </h3>

                            {addr.isDefault && (
                              <span className="text-[10px] bg-green-700 text-white px-2 py-1 rounded-md font-bold uppercase">
                                Mặc định
                              </span>
                            )}
                          </div>

                          <p className="text-green-700 font-semibold text-sm mb-1">
                            {addr.receiverPhone}
                          </p>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {addr.fullAddress}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-green-100 flex items-center justify-center text-gray-600 hover:text-green-700 transition">
                            <Edit3 size={18} />
                          </button>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-500 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-800">
                  Đơn hàng của bạn
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Theo dõi các đơn hàng bạn đã đặt tại Agri Store.
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
                {orderStatusTabs.map((tab) => {
                  const count =
                    tab.value === 'ALL'
                      ? orders.length
                      : orders.filter((order) => order.orderStatus === tab.value).length;

                  return (
                    <button
                      key={tab.value}
                      onClick={() => setOrderFilter(tab.value)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${
                        orderFilter === tab.value
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`ml-2 text-xs ${
                          orderFilter === tab.value ? 'text-green-100' : 'text-gray-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isLoadingOrders ? (
                <div className="py-16 text-center text-gray-500">
                  Đang tải đơn hàng...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <ShoppingBag size={42} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-gray-700">
                    {orderFilter === 'ALL'
                      ? 'Bạn chưa có đơn hàng nào'
                      : 'Không có đơn hàng ở trạng thái này'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Khi bạn mua phân bón hoặc vật tư, đơn hàng sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="rounded-2xl border border-gray-200 p-5 bg-white hover:border-green-200 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-black text-gray-800 text-lg">
                            Đơn hàng #{order.orderCode}
                          </h3>

                          <p className="text-gray-500 text-sm mt-1">
                            Ngày đặt: {formatDate(order.createdAt)}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            Thanh toán: {getPaymentStatusLabel(order.paymentStatus)}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            Giao đến: {order.shippingAddress}
                          </p>
                        </div>

                        <div className="flex md:flex-col gap-2 md:items-end">
                          <span
                            className={`text-[11px] px-3 py-1 rounded-full font-black uppercase ${getStatusClass(
                              order.orderStatus
                            )}`}
                          >
                            {getOrderStatusLabel(order.orderStatus)}
                          </span>

                          <span className="text-lg font-black text-green-700">
                            {formatMoney(order.totalAmount)}
                          </span>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl font-bold transition active:scale-95"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        {order.items?.map((item) => (
                          <div
                            key={`${order.orderId}-${item.variantId}`}
                            className="flex gap-3 items-center"
                          >
                            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={item.image || 'https://placehold.co/100x100/e2e8f0/64748b?text=Agri'}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm line-clamp-1">
                                {item.name}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                Quy cách: {item.weightVolume || 'Tiêu chuẩn'}
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                SL: {item.quantity} × {formatMoney(item.unitPrice)}
                              </p>
                            </div>

                            <p className="font-bold text-gray-800 text-sm shrink-0">
                              {formatMoney(item.totalPrice)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-lg">
              <div className="mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-black text-gray-800">
                  Đổi mật khẩu
                </h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  {
                    key: 'old',
                    value: passwordForm.oldPassword,
                    placeholder: 'Mật khẩu hiện tại',
                    onChange: (v) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: v,
                      }),
                  },
                  {
                    key: 'new',
                    value: passwordForm.newPassword,
                    placeholder: 'Mật khẩu mới',
                    onChange: (v) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: v,
                      }),
                  },
                  {
                    key: 'cf',
                    value: passwordForm.confirmPassword,
                    placeholder: 'Nhập lại mật khẩu mới',
                    onChange: (v) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: v,
                      }),
                  },
                ].map((item) => (
                  <div key={item.key} className="relative">
                    <input
                      required
                      type={showPass[item.key] ? 'text' : 'password'}
                      placeholder={item.placeholder}
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      className={`${inputClass} pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPass({
                          ...showPass,
                          [item.key]: !showPass[item.key],
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPass[item.key] ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition active:scale-95"
                >
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
          )}
        </main>

        {selectedOrder && (
          <div  
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">
                    Chi tiết đơn hàng
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Mã đơn: #{selectedOrder.orderCode}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-5 md:p-6 space-y-6">
                {/* Status summary */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                      <CalendarDays size={17} />
                      Ngày đặt
                    </div>

                    <p className="font-black text-gray-800">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                      <Package size={17} />
                      Trạng thái
                    </div>

                    <span
                      className={`inline-block text-[11px] px-3 py-1 rounded-full font-black uppercase ${getStatusClass(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {getOrderStatusLabel(selectedOrder.orderStatus)}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
                      <CreditCard size={17} />
                      Thanh toán
                    </div>

                    <p className="font-black text-gray-800">
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-2">
                      <ReceiptText size={17} />
                      Tổng tiền
                    </div>

                    <p className="font-black text-green-700 text-xl">
                      {formatMoney(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Receiver / shipping info */}
                <div className="rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Truck size={20} className="text-green-700" />
                    Thông tin giao hàng
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col md:flex-row md:gap-2">
                      <span className="text-gray-500 font-semibold md:w-36">
                        Người nhận:
                      </span>

                      <span className="text-gray-800 font-medium">
                        {selectedOrder.receiverName || 'Đang cập nhật'}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:gap-2">
                      <span className="text-gray-500 font-semibold md:w-36">
                        Số điện thoại:
                      </span>

                      <span className="text-gray-800 font-medium">
                        {selectedOrder.receiverPhone || 'Đang cập nhật'}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:gap-2">
                      <span className="text-gray-500 font-semibold md:w-36">
                        Địa chỉ giao hàng:
                      </span>

                      <span className="text-gray-800 font-medium">
                        {selectedOrder.shippingAddress || 'Đang cập nhật'}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:gap-2">
                      <span className="text-gray-500 font-semibold md:w-36">
                        Phương thức:
                      </span>

                      <span className="text-gray-800 font-medium">
                        {selectedOrder.paymentMethodName || 'Đang cập nhật'}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:gap-2">
                      <span className="text-gray-500 font-semibold md:w-36">
                        Ghi chú:
                      </span>

                      <span className="text-gray-800 font-medium">
                        {selectedOrder.note || 'Không có ghi chú'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-800">
                      Sản phẩm trong đơn
                    </h3>

                    <span className="text-sm text-gray-500 font-semibold">
                      {getTotalQuantity(selectedOrder.items)} sản phẩm
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={`${selectedOrder.orderId}-${item.variantId}`}
                        className="p-4 flex gap-4"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0">
                          <img
                            src={
                              item.image ||
                              'https://placehold.co/100x100/e2e8f0/64748b?text=Agri'
                            }
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-gray-800 line-clamp-2">
                            {item.name}
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            Quy cách: {item.weightVolume || 'Tiêu chuẩn'}
                          </p>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400 font-semibold">Đơn giá</p>
                              <p className="font-bold text-gray-800">
                                {formatMoney(item.unitPrice)}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400 font-semibold">Số lượng</p>
                              <p className="font-bold text-gray-800">
                                {item.quantity}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-400 font-semibold">Thành tiền</p>
                              <p className="font-black text-green-700">
                                {formatMoney(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price summary */}
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <h3 className="font-black text-gray-800 mb-4">
                    Tổng kết thanh toán
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-semibold">
                        Tạm tính
                      </span>

                      <span className="font-bold text-gray-800">
                        {formatMoney(selectedOrder.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-semibold">
                        Phí vận chuyển
                      </span>

                      <span className="font-bold text-gray-800">
                        {formatMoney(selectedOrder.shippingFee)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-black text-gray-800">
                        Tổng thanh toán
                      </span>

                      <span className="font-black text-green-700 text-2xl">
                        {formatMoney(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col md:flex-row gap-3 justify-end">
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}