import { Search, Bell, User, Menu } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b border-gray-200">
      <div className="flex items-center">
        <button className="md:hidden p-2 mr-4 text-gray-500 hover:text-green-600">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex bg-gray-100 rounded-lg px-4 py-2 w-96 items-center focus-within:ring-2 focus-within:ring-green-100 transition-all">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Thích tìm phân bón..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <button className="relative p-2 text-gray-400 hover:text-green-600 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center cursor-pointer pl-4 border-l border-gray-200">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-bold text-gray-700">Admin Nguyễn</p>
            <p className="text-xs text-gray-500 font-medium">Quản lý cửa hàng</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;