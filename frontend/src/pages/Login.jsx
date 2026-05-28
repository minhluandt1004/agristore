import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { mergeCartToServer } from '../store/cartSlice';
import {
  Lock,
  ArrowRight,
  Home,
  Loader2,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/users/login';

export default function Login() {

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {

    e.preventDefault();

    setError('');
    setIsLoading(true);

    try {

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          password
        })
      });

      const contentType = response.headers.get('content-type');

      let data;
      let errorMessageToDisplay = '';

      if (contentType && contentType.includes('application/json')) {

        data = await response.json();
        errorMessageToDisplay = data.message;

      } else {

        const rawText = await response.text();

        console.error('Lỗi thô từ Server:', rawText);

        errorMessageToDisplay = `Lỗi hệ thống (Mã ${response.status}). Vui lòng xem Console (F12).`;

      }

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));

        // Gộp giỏ hàng localStorage vào giỏ hàng server
        await dispatch(mergeCartToServer(data.id));

        // Báo cho Navbar / Cart cập nhật lại
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('cart-updated'));

        // Nếu trước đó bị bắt đăng nhập ở checkout thì quay lại checkout
        const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');

        if (redirectAfterLogin) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectAfterLogin);
        } else {
          navigate('/');
        }

      } else {

        setError(
          errorMessageToDisplay ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại!'
        );

      }

    } catch (err) {

      setError('Lỗi kết nối Server! Vui lòng thử lại sau.');

    } finally {

      setIsLoading(false);

    }

  };

  return (

    <div className="min-h-[85vh] py-6 bg-[#f5f7f6]">

      <div className="max-w-7xl mx-auto px-4">

        <div className="flex overflow-hidden rounded-3xl shadow-sm border border-gray-200 bg-white">

          {/* LEFT */}
          <div className="hidden lg:flex w-1/2 bg-[#064e3b] relative items-center justify-center overflow-hidden">

            <img
              src="https://scontent.fsgn5-12.fna.fbcdn.net/v/t39.30808-6/438275710_122145384944147457_2317539336507648367_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=1Ve-sujbQZkQ7kNvwFhWAW_&_nc_oc=AdpLCAjhghYYMLWjYb-Q9lSG6tvYjDOS6NjjR4w2b9CMIYRhtAlkX9cYDRzqbjj0T3Q&_nc_zt=23&_nc_ht=scontent.fsgn5-12.fna&_nc_gid=XU_dre2kIdz74YtHedLM3g&_nc_ss=7b2a8&oh=00_Af5Cu4BlsfdHjT2F-FJMYhxnuXjKN7D-Jc1ww9c2dFRX1Q&oe=6A1B259E"
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
                CHÀO MỪNG TRỞ LẠI <br />
                VỚI AGRI STORE
              </h1>

              <p className="text-emerald-100 text-lg leading-relaxed">
                Đăng nhập để nhận ngay các ưu đãi phân bón độc quyền
                và theo dõi tiến trình đơn hàng của bạn.
              </p>

            </div>

          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white">

            <div className="max-w-md w-full">

              <div className="text-center mb-8">

                <h2 className="text-3xl font-black text-gray-800 mb-2">
                  Đăng Nhập
                </h2>

                <p className="text-gray-500 text-sm">
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/dang-ky"
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Đăng ký ngay
                  </Link>
                </p>

              </div>

              {error && (

                <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">

                  <span className="block w-2 h-2 bg-red-500 rounded-full"></span>

                  {error}

                </div>

              )}

              <form
                className="space-y-5"
                onSubmit={handleLogin}
              >

                {/* PHONE */}
                <div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Số điện thoại
                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Nhập số điện thoại..."
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div>

                  <div className="flex justify-between items-center mb-2">

                    <label className="block text-sm font-bold text-gray-700">
                      Mật khẩu
                    </label>

                    <button
                      type="button"
                      className="text-sm font-semibold text-orange-500 hover:underline"
                    >
                      Quên mật khẩu?
                    </button>

                  </div>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full border border-gray-200 rounded-xl pl-12 pr-12 py-3.5 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>

                  </div>

                </div>

                {/* REMEMBER */}
                <div className="flex items-center">

                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />

                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-600 font-medium cursor-pointer"
                  >
                    Ghi nhớ đăng nhập
                  </label>

                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#064e3b] hover:bg-emerald-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition uppercase tracking-wider shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >

                  {isLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đăng nhập
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