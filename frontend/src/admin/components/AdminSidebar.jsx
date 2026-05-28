import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Box, ShoppingCart, Layers, Users,
  Gift, BarChart2, Settings, Sprout, FileText
} from "lucide-react";

const menuItems = [
  { name: "Tổng quan", icon: <Home size={20} />, path: "/" },
  { name: "Sản phẩm", icon: <Box size={20} />, path: "/products" },
  { name: "Đơn hàng", icon: <ShoppingCart size={20} />, path: "/orders" },
  { name: "Danh mục", icon: <Layers size={20} />, path: "/categories" },
  { name: "Khách hàng", icon: <Users size={20} />, path: "/customers" },
  { name: "Khuyến mãi", icon: <Gift size={20} />, path: "/promotions" },
  { name: "Bài viết & Video", icon: <FileText size={20} />, path: "/posts" },
  { name: "Thống kê", icon: <BarChart2 size={20} />, path: "/analytics" },
  { name: "Cài đặt", icon: <Settings size={20} />, path: "/settings" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#064e3b] text-white min-h-screen shadow-xl sticky top-0 flex flex-col">
      <div className="p-6 flex items-center justify-center gap-3 border-b border-white/10">
        <div className="bg-green-500 p-2 rounded-lg">
          <Sprout size={24} className="text-white" />
        </div>
        <div className="font-extrabold text-xl tracking-wide">AGRI STORE</div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-4 px-2">
          Menu quản trị
        </div>
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-green-600 text-white shadow-md" 
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-green-400 group-hover:text-white transition-colors"}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-xs text-green-400">© 2026 AgriStore v1.0.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;