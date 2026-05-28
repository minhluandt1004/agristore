import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  
  // Các state quản lý form và trạng thái
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State quản lý checkbox Ghi nhớ đăng nhập
  const [rememberMe, setRememberMe] = useState(false);

  // Chạy 1 lần khi component vừa mount: Kiểm tra xem có dữ liệu lưu sẵn không
  useEffect(() => {
    const savedLoginData = localStorage.getItem('agri_admin_saved_login');
    if (savedLoginData) {
      try {
        const { savedId, savedPassword } = JSON.parse(savedLoginData);
        if (savedId && savedPassword) {
          setLoginId(savedId);
          setPassword(savedPassword);
          setRememberMe(true); // Tự động tick vào checkbox
        }
      } catch (e) {
        console.error("Lỗi parse dữ liệu login:", e);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API xuống Spring Boot Backend
      const response = await fetch('http://localhost:8080/api/v1/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }

      // 1. Đăng nhập thành công -> Lưu dữ liệu phiên làm việc (token/session)
      localStorage.setItem('admin', JSON.stringify(data));
      
      // 2. Xử lý chức năng "Ghi nhớ đăng nhập"
      if (rememberMe) {
        // Nếu chọn ghi nhớ, lưu tài khoản & mật khẩu
        localStorage.setItem('agri_admin_saved_login', JSON.stringify({ 
          savedId: loginId, 
          savedPassword: password 
        }));
      } else {
        // Nếu không chọn, xóa dữ liệu đã lưu cũ (nếu có)
        localStorage.removeItem('agri_admin_saved_login');
      }
      
      // 3. Chuyển hướng vào trang chủ
      navigate('/');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#064e3b] via-green-800 to-green-600">
      
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-[420px] animate-fade-in relative overflow-hidden">
        {/* Lớp trang trí góc */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-100 rounded-full blur-2xl opacity-60"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="bg-green-100 p-4 rounded-2xl mb-4 shadow-inner">
            <Sprout size={40} className="text-green-700" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Chào mừng trở lại!</h2>
          <p className="text-gray-500 mt-2 text-sm">Đăng nhập vào hệ thống quản trị AgriStore</p>
        </div>

        {/* Khung hiển thị lỗi từ Backend */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2 animate-fade-in relative z-10">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email hoặc Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                placeholder="admin@agristore.com hoặc 0901..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kiểm tra...
              </span>
            ) : (
              "Đăng nhập hệ thống"
            )}
          </button>
        </form>
      </div>

    </div>
  );
}