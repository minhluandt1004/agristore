import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart2, Settings, Sprout } from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', path: '/admin/products', icon: Package },
    { name: 'Danh mục', path: '/admin/categories', icon: Tag },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Khách hàng', path: '/admin/customers', icon: Users },
    { name: 'Phân tích', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Cài đặt', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl flex flex-col z-20 hidden md:flex">
      <div className="flex items-center justify-center h-20 border-b border-gray-100 px-6">
        <Sprout className="w-8 h-8 text-green-600 mr-2 flex-shrink-0" />
        <h1 className="text-xl font-bold text-green-800 truncate">GreenAgri Admin</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-green-50 text-green-700 font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-green-600 font-medium'
              }`
            }
          >
            <item.icon className={`w-5 h-5 mr-3 ${/* eslint-disable-next-line react/prop-types */ isActive ? 'text-green-600' : ''}`} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;