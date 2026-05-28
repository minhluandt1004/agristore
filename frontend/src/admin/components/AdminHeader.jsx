import React from "react";
import { LogOut, Bell, Search, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ adminName, adminRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  // Hàm dịch Role sang tiếng Việt cho thân thiện
  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'Quản trị viên';
    if (role === 'STAFF') return 'Nhân viên';
    return 'Người dùng';
  };

  return (
    <header className="flex items-center justify-between bg-white text-gray-700 px-8 py-4 shadow-sm border-b border-gray-100 sticky top-0 z-50">
      
      {/* Thanh tìm kiếm */}
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-96 focus-within:ring-2 focus-within:ring-green-500 transition-all">
        <Search size={18} className="text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
        />
      </div>

      {/* Khu vực Profile & Notifications */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div> {/* Đường phân cách */}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer group">
            <UserCircle size={32} className="text-green-700 group-hover:text-green-600 transition" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800 leading-none">
                {adminName || "Admin"}
              </span>
              <span className="text-xs text-gray-500 mt-1 font-medium">
                {getRoleLabel(adminRole)}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;