import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  MapPin,
  ShieldCheck,
  BookUser,
  X,
  Loader2,
  CheckCircle2,
  Wallet,
  Landmark,
  LogIn,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clearCart } from '../store/cartSlice';

const GEO_API = 'https://provinces.open-api.vn/api';
const PLACEHOLDER_IMG = 'https://placehold.co/200x200/e2e8f0/64748b?text=Agri';

const StackedInput = ({ label, value, onChange, type = 'text', disabled = false, suffix, placeholder = '' }) => (
  <div className={`relative w-full border border-gray-200 rounded-2xl px-4 py-2 mb-4 bg-white transition-all
    ${!disabled ? 'focus-within:border-green-600' : 'bg-gray-50'}`}>
    <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
    <div className="flex items-center justify-between">
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-transparent outline-none text-base font-semibold transition-colors ${
          disabled ? 'text-gray-500' : 'text-gray-900'
        }`}
      />
      {suffix && <div className="ml-2">{suffix}</div>}
    </div>
  </div>
);

export default function Checkout() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const { items: cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);

  const userId = user?.id;

  const buyNowItem = location.state?.buyNowItem;
  const [checkoutItems] = useState(buyNowItem ? [buyNowItem] : cartItems);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [phoneError, setPhoneError] = useState('');
  const [wards, setWards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddr, setIsLoadingAddr] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  

  const [isConfirming, setIsConfirming] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    email: user?.email || '',
    province: { code: '', name: '' },
    district: { code: '', name: '' },
    ward: { code: '', name: '' },
    specificAddress: '',
    note: '',
    addressId: null,
  });

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const ship = 25000;
  const finalTotal = subtotal + ship - discount;

  useEffect(() => {
    const initData = async () => {
      const pRes = await fetch(`${GEO_API}/p/`);
      const pData = await pRes.json();
      setProvinces(pData);

      if (userId) {
        setIsLoadingAddr(true);
        const addrRes = await fetch(`http://localhost:8080/api/v1/users/${userId}/addresses`);
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData);
          const def = addrData.find((a) => a.isDefault) || addrData[0];
          if (def) await autoFillAddress(def, pData);
        }
        setIsLoadingAddr(false);
      }
    };
    initData();
    window.scrollTo(0, 0);
  }, [userId]);

  const checkPhoneExist = async (value) => {
    const phone = value.replace(/\D/g, '');

    if (phone.length < 10 || phone.length > 11) {
      setPhoneError('');
      return false;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/v1/users/check-phone?phone=${encodeURIComponent(phone)}`);

      if (!res.ok) {
        setPhoneError('Không thể kiểm tra số điện thoại');
        return false;
      }

      const data = await res.json();

      if (data.exists) {
        setPhoneError('Số điện thoại này đã có tài khoản. Vui lòng đăng nhập để mua hàng.');
        return true;
      }

      setPhoneError('');
      return false;
    } catch (err) {
      console.error(err);
      setPhoneError('Lỗi kiểm tra số điện thoại');
      return false;
    }
  };


  const autoFillAddress = async (addr, currentProvinces) => {
    try {
      const parts = addr.fullAddress.split(',').map((p) => p.trim());
      const specific = parts[0] || '';
      const wName = parts[1] || '';
      const dName = parts[2] || '';
      const pName = parts[3] || '';

      const pMatch = currentProvinces.find((p) => p.name === pName);
      if (pMatch) {
        const dRes = await fetch(`${GEO_API}/p/${pMatch.code}?depth=2`);
        const dData = await dRes.json();
        setDistricts(dData.districts);
        const dMatch = dData.districts.find((d) => d.name === dName);

        if (dMatch) {
          const wRes = await fetch(`${GEO_API}/d/${dMatch.code}?depth=2`);
          const wData = await wRes.json();
          setWards(wData.wards);
          const wMatch = wData.wards.find((w) => w.name === wName);

          setFormData((prev) => ({
            ...prev,
            receiverName: addr.receiverName,
            receiverPhone: addr.receiverPhone,
            specificAddress: specific,
            province: { code: pMatch.code, name: pName },
            district: { code: dMatch.code, name: dName },
            ward: { code: wMatch?.code || '', name: wName },
            addressId: addr.id,
          }));
        }
      }
    } catch (e) {
      console.error('Auto-fill error:', e);
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return toast.error('Vui lòng nhập mã giảm giá');
    if (code === 'AGRI10') {
      const couponDiscount = Math.min(subtotal * 0.1, 50000);
      setDiscount(couponDiscount);
      toast.success('Đã áp dụng mã giảm giá');
    } else {
      setDiscount(0);
      toast.error('Mã giảm giá không hợp lệ');
    }
  };
  const handleCartAfterOrderSuccess = () => {
    // Nếu là Mua ngay thì không xóa giỏ hàng
    if (buyNowItem) {
      return;
    }

    // Nếu đặt hàng từ giỏ hàng thì xóa toàn bộ giỏ
    dispatch(clearCart());
    window.dispatchEvent(new Event('cart-updated'));
  };

  const submitOrder = async () => {
    try {
      let userId = user?.id;
      let shippingAddressId = formData.addressId;

      // 1️⃣ Nếu chưa có user (guest), tạo guest user trước
      if (!userId) {
        const guestRes = await fetch('http://localhost:8080/api/v1/users/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.receiverPhone,
            fullName: formData.receiverName,
            email: formData.email
          }),
        });
        if (!guestRes.ok) {
          const text = await guestRes.text();
          console.error('Guest API error:', text);
          toast.error(text || 'Số điện thoại/email đã được đăng ký. Vui lòng đăng nhập để mua hàng.');
          return;
        }

        const guestData = await guestRes.json();
        userId = guestData.id;

      }

      // 2️⃣ Nếu chưa có shippingAddressId, tạo address mới
      if (!shippingAddressId && userId) {
        const resAddr = await fetch(`http://localhost:8080/api/v1/users/${userId}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiverName: formData.receiverName,
            receiverPhone: formData.receiverPhone,
            fullAddress: `${formData.specificAddress}, ${formData.ward.name}, ${formData.district.name}, ${formData.province.name}`,
            isDefault: false,
          }),
        });
        const addrData = await resAddr.json();
        shippingAddressId = addrData.id;
      }

      // 3️⃣ Chuẩn bị payload checkout
      const payload = {
        userId,
        shippingAddressId,
        paymentMethodId: paymentMethod === 'COD' ? 1 : 2,
        note: formData.note,
        items: checkoutItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        subtotal,
        shippingFee: ship,
        totalAmount: finalTotal,

        clearCartAfterCheckout: !buyNowItem,
      };

      console.log('Payload trước khi gửi checkout:', payload);

      // 4️⃣ Gọi API checkout
      const res = await fetch('http://localhost:8080/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Checkout API error:', text);
        toast.error('Không thể tạo đơn hàng');
        navigate('/payment-fail');
        return;
      }

      const data = await res.json();

      // 5️⃣ Thanh toán COD hoặc online
      if (paymentMethod === 'COD') {
        handleCartAfterOrderSuccess();
        navigate('/payment-success', { state: { order: data } });
        return;
      }

      const payRes = await fetch(`http://localhost:8080/api/v1/orders/${data.orderId}/payment?success=true`, { method: 'POST' });
      if (payRes.ok) {
        handleCartAfterOrderSuccess();
        navigate('/payment-success', { state: { order: data } });
      } else {
        navigate('/payment-fail');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi đặt hàng');
      navigate('/payment-fail');
    }
  };

  const handlePlaceOrder = async () => {
    const phoneRegex = /^(0|\+84)\d{9,10}$/;
    const phone = formData.receiverPhone.replace(/\D/g, '');

    if (!formData.receiverName || !phone || !formData.specificAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    // Nếu chưa đăng nhập thì phải check trùng lần cuối trước khi tạo guest
    if (!userId) {
      const phoneDuplicated = await checkPhoneExist(phone);

      if (phoneDuplicated) {
        sessionStorage.setItem('redirectAfterLogin', '/thanh-toan');
        toast.error('Số điện thoại đã có tài khoản. Vui lòng đăng nhập để tiếp tục mua hàng.');
        navigate('/dang-nhap');
        return;
      }
    }

    setIsConfirming(true);
    setProgress(0);
    let localProgress = 0;

    intervalRef.current = setInterval(() => {
      localProgress += 2;
      setProgress(localProgress);

      if (localProgress >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsConfirming(false);
        submitOrder();
      }
    }, 100);
  };

  const handleCancelOrder = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConfirming(false);
    setProgress(0);
    toast('Đặt hàng đã bị hủy');
  };

  const handleAddressBookClick = () => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập để xem sổ địa chỉ');
      navigate('/dang-nhap');
      return;
    }
    setShowAddressModal(true);
  };

  const onProvinceChange = (e) => {
    const p = provinces.find((x) => x.code == e.target.value);
    if (!p) return;

    setFormData({
      ...formData,
      province: { code: p.code, name: p.name },
      district: { code: '', name: '' },
      ward: { code: '', name: '' },
    });

    fetch(`${GEO_API}/p/${p.code}?depth=2`)
      .then((res) => res.json())
      .then((d) => setDistricts(d.districts));
  };

  const onDistrictChange = (e) => {
    const d = districts.find((x) => x.code == e.target.value);
    if (!d) return;

    setFormData({
      ...formData,
      district: { code: d.code, name: d.name },
      ward: { code: '', name: '' },
    });

    fetch(`${GEO_API}/d/${d.code}?depth=2`)
      .then((res) => res.json())
      .then((d) => setWards(d.wards));
  };

  return (
    <div className="bg-[#f5f7f2] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-green-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
                <button
                  onClick={handleAddressBookClick}
                  className="text-green-700 font-bold text-sm flex items-center gap-1 hover:text-green-900"
                >
                  {userId ? (
                    <>
                      <BookUser size={16} /> Sổ địa chỉ
                    </>
                  ) : (
                    <>
                      <LogIn size={16} /> Đăng nhập để xem địa chỉ
                    </>
                  )}
                </button>
              </div>

              {!userId && (
                <div className="mb-5 bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3 text-green-800">
                  <MapPin size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm leading-6">
                    Bạn có thể nhập địa chỉ giao hàng bên dưới. Đăng nhập để dùng địa chỉ đã lưu cho lần mua sau.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StackedInput
                  label="Họ và tên người nhận"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                />
                <StackedInput
                  label="Số điện thoại"
                  value={formData.receiverPhone}
                  onChange={(e) => {
                    const value = e.target.value;
                    const phone = value.replace(/\D/g, '');

                    setFormData({ ...formData, receiverPhone: phone });

                    // Nếu đã đăng nhập thì đây chỉ là SĐT người nhận hàng
                    // Không được check trùng tài khoản
                    if (userId) {
                      setPhoneError('');
                      return;
                    }

                    // Chỉ khách chưa đăng nhập mới check trùng SĐT tài khoản
                    if (phone.length === 10 || phone.length === 11) {
                      checkPhoneExist(phone);
                    } else {
                      setPhoneError('');
                    }
                  }}
                  suffix={
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                      className="w-5 h-3.5 rounded-sm"
                      alt="VN"
                    />
                  }
                />

                {!userId && phoneError && (
                  <p className="text-sm text-red-600 font-semibold -mt-2 mb-4">
                    {phoneError}
                  </p>
                )}
              </div>

              <StackedInput
                label="Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
                placeholder="Có thể bỏ trống"
              />

              <StackedInput label="Quốc gia" value="Vietnam" disabled />

              <StackedInput
                label="Địa chỉ cụ thể"
                value={formData.specificAddress}
                onChange={(e) => setFormData({ ...formData, specificAddress: e.target.value })}
                placeholder="Ví dụ: số nhà, tên đường, thôn/xóm..."
              />

              <div className="border border-gray-200 rounded-2xl px-4 py-3 bg-white mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-2">Tỉnh/TP, Quận/Huyện, Phường/Xã</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={formData.province.code}
                    onChange={onProvinceChange}
                    className="border border-gray-200 rounded-xl px-3 py-2 outline-none text-sm font-semibold text-gray-900 bg-white cursor-pointer focus:border-green-600"
                  >
                    <option value="">Chọn Tỉnh/TP</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.district.code}
                    onChange={onDistrictChange}
                    disabled={!formData.province.code}
                    className="border border-gray-200 rounded-xl px-3 py-2 outline-none text-sm font-semibold text-gray-900 bg-white cursor-pointer focus:border-green-600 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.ward.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ward: {
                          code: e.target.value,
                          name: wards.find((w) => w.code == e.target.value)?.name || '',
                        },
                      })
                    }
                    disabled={!formData.district.code}
                    className="border border-gray-200 rounded-xl px-3 py-2 outline-none text-sm font-semibold text-gray-900 bg-white cursor-pointer focus:border-green-600 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <StackedInput
                label="Ghi chú thêm"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              />
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl border border-green-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Phương thức thanh toán</h2>

              <div className="space-y-3">
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-700">
                      <Wallet size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">Thanh toán khi nhận hàng</p>
                      <p className="text-sm text-gray-500">Trả tiền trực tiếp khi nhận phân bón/vật tư</p>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle2 className="text-green-600" size={22} />}
                </div>

                <div
                  onClick={() => setPaymentMethod('BANK')}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'BANK' ? 'border-green-600 bg-green-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-700">
                      <Landmark size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-gray-500">Chuyển khoản sau khi được xác nhận đơn</p>
                    </div>
                  </div>
                  {paymentMethod === 'BANK' && <CheckCircle2 className="text-green-600" size={22} />}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-3xl border border-green-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Giỏ hàng</h2>

              <div className="space-y-5">
                {checkoutItems.map((item) => (
                  <div key={item.variantId || item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-100 p-1 flex items-center justify-center shrink-0">
                      <img src={item.image || PLACEHOLDER_IMG} className="max-w-full max-h-full object-contain" alt={item.name} />
                    </div>

                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="text-base font-bold text-gray-900 line-clamp-2">{item.name}</h4>

                      <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                        <p>
                          <span className="font-semibold">Quy cách:</span> {item.weightVolume || 'Tiêu chuẩn'}
                        </p>
                        <p>
                          <span className="font-semibold">Số lượng:</span> {item.quantity}
                        </p>
                      </div>

                      <p className="text-base font-bold text-green-800 mt-1">{item.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 md:p-6 rounded-3xl border border-green-100 shadow-sm sticky top-24">
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã nếu có"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-semibold text-gray-900 bg-white focus:border-green-600"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 rounded-xl font-bold text-sm"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-base text-gray-600 font-medium">
                  <span>Tổng tiền hàng</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-base text-gray-600 font-medium">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-gray-900">{ship.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-base text-green-700 font-medium">
                    <span>Giảm giá</span>
                    <span className="font-bold">- {discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-7">
                <span className="font-bold text-gray-900 text-lg">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-orange-600">{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isConfirming || (!userId && !!phoneError)}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-sm active:scale-95 transition-all ${
                    isConfirming || (!userId && phoneError)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-700 hover:bg-green-800 text-white'
                  }`}
                >
                  {isConfirming
                    ? 'Đang xác nhận...'
                    : !userId && phoneError
                      ? 'VUI LÒNG ĐĂNG NHẬP'
                      : 'ĐẶT HÀNG'}
                </button>
              </div>

              {isConfirming && (
                <div className="mt-4 p-4 border border-gray-300 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-700 mb-2">
                    Đang xác nhận đơn hàng, bạn có thể hủy trong vài giây...
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <button
                    onClick={handleCancelOrder}
                    className="text-red-600 font-bold text-sm hover:underline"
                  >
                    HỦY ĐẶT HÀNG
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 font-semibold">
                <ShieldCheck size={15} className="text-green-600" /> Bảo mật thông tin khách hàng
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddressModal && userId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-green-50">
              <h3 className="font-bold text-gray-900 text-lg">Sổ địa chỉ của bạn</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 hover:bg-white rounded-xl border transition text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {isLoadingAddr ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin inline text-green-700" />
                </div>
              ) : addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => {
                      autoFillAddress(addr, provinces);
                      setShowAddressModal(false);
                    }}
                    className={`p-4 border-2 rounded-2xl cursor-pointer hover:border-green-600 transition-all ${
                      formData.receiverPhone === addr.receiverPhone ? 'border-green-600 bg-green-50' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-base text-gray-900">{addr.receiverName}</p>
                      {addr.isDefault && <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-md font-bold">Mặc định</span>}
                    </div>
                    <p className="text-sm text-gray-600">{addr.receiverPhone}</p>
                    <p className="text-sm text-gray-500 mt-1">{addr.fullAddress}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Bạn chưa có địa chỉ đã lưu.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
