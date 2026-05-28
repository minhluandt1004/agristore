import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { API_ENDPOINTS } from '../api/apiConfig';
import { mergeCartToServer } from '../store/cartSlice';
import {
  Lock,
  User,
  Phone,
  ArrowRight,
  Home,
  Loader2,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Vui lòng nhập đầy đủ thông tin!";
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!phoneRegex.test(formData.phone)) {
      return "Số điện thoại không hợp lệ (10 số)!";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.email && !emailRegex.test(formData.email)) {
      return "Định dạng Email không hợp lệ!";
    }

    if (formData.password.length < 6) {
      return "Mật khẩu phải có tối thiểu 6 ký tự!";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không trùng khớp!";
    }

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage({
      type: '',
      text: ''
    });

    const validationError = validateForm();

    if (validationError) {
      setMessage({
        type: 'error',
        text: validationError
      });

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          fullName: formData.fullName.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          email: formData.email.trim(),
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Đăng ký xong thì đăng nhập luôn bằng user backend trả về
        localStorage.setItem('user', JSON.stringify(data));

        // Gộp giỏ hàng localStorage vào server
        await dispatch(mergeCartToServer(data.id));

        // Báo cho Navbar / Cart cập nhật
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('cart-updated'));

        setMessage({
          type: 'success',
          text: 'Đăng ký thành công! Đang chuyển hướng...'
        });

        const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');

        setTimeout(() => {
          if (redirectAfterLogin) {
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectAfterLogin);
          } else {
            navigate('/');
          }
        }, 800);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Có lỗi xảy ra!'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Không thể kết nối tới server!'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        <div className="flex min-h-[85vh] overflow-hidden rounded-3xl shadow-sm border border-gray-100">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex w-1/2 bg-[#064e3b] relative items-center justify-center overflow-hidden">

            <img
              src="https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-6/475099141_122190730796147457_1621280547292797449_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=vtow2OoXzf8Q7kNvwHLMlY3&_nc_oc=AdqyonNwiZZ4xjLMpkP8YGzlN62nhSAoZukXS9Y57oLHpPJP5vqE3PSH2khJaTHBnJo&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=12wrQM9c1IZn04K90pkTlg&_nc_ss=7b2a8&oh=00_Af5b4UPu_7Ghx9oo4uZkvv0htFC25GjZFVV-5Zn4-VHnbg&oe=6A09246B"
              alt="Nông nghiệp"
              className="absolute inset-0 w-full h-full object-cover object-left opacity-40 mix-blend-overlay"
            />

            <Link
              to="/"
              className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-white transition"
            >
              <Home size={16} />
              Về trang chủ
            </Link>

            <div className="relative z-10 p-12 max-w-lg text-white">
              <h1 className="text-4xl font-black mb-4 leading-tight">
                GIA NHẬP CỘNG ĐỒNG NÔNG NGHIỆP XANH
              </h1>

              <p className="text-emerald-100 text-lg leading-relaxed">
                Tạo tài khoản để mua phân bón, thuốc bảo vệ thực vật và các giải pháp canh tác hiện đại với giá tốt nhất.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4 py-10 lg:px-20 overflow-y-auto">

            <div className="max-w-md w-full">

              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-800 mb-2">
                  Đăng Ký Tài Khoản
                </h2>

                <p className="text-gray-500">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/dang-nhap"
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleRegister}>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Họ và tên
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>

                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullName: e.target.value
                        })
                      }
                      placeholder="VD: Nguyễn Văn A"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email <span className="text-gray-400 font-medium">(không bắt buộc)</span>
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value
                        })
                      }
                      placeholder="VD: nongdanviet@gmail.com"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Số điện thoại
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value
                        })
                      }
                      placeholder="09xx xxx xxx"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Mật khẩu
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value
                        })
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-gray-50 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Xác nhận mật khẩu
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value
                        })
                      }
                      placeholder="Nhập lại mật khẩu"
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-gray-50 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />

                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-600 leading-relaxed font-medium"
                  >
                    Tôi đồng ý với{" "}
                    <a
                      href="#"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a
                      href="#"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Chính sách bảo mật
                    </a>
                  </label>
                </div>

                {message.text && (
                  <div
                    className={`mt-4 p-4 rounded-xl text-sm font-semibold border flex items-start gap-2 ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    <span
                      className={`block w-2 h-2 mt-1.5 shrink-0 rounded-full ${
                        message.type === 'success'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></span>

                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#064e3b] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-800 transition shadow-lg shadow-emerald-900/20 uppercase tracking-widest group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tạo tài khoản
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}