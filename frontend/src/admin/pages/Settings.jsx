import React, { useState } from "react";
import { 
  Store, CreditCard, Truck, User, Bell, 
  Save, Globe, Phone, Mail, MapPin 
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="pb-8 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình cửa hàng, thanh toán và các tính năng khác</p>
        </div>
        <button className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm">
          <Save size={16} /> Lưu cài đặt
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
          <nav className="space-y-1">
            <TabMenu active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<Store size={18}/>} label="Cửa hàng chung" />
            <TabMenu active={activeTab === 'payment'} onClick={() => setActiveTab('payment')} icon={<CreditCard size={18}/>} label="Thanh toán" />
            <TabMenu active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} icon={<Truck size={18}/>} label="Vận chuyển" />
            <TabMenu active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18}/>} label="Thông báo" />
            <TabMenu active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<User size={18}/>} label="Tài khoản Admin" />
          </nav>
        </div>

        {/* Content Settings */}
        <div className="flex-1 p-6 lg:p-10">
          
          {activeTab === 'general' && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Thông tin cửa hàng</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên website / Cửa hàng</label>
                  <input type="text" defaultValue="Agri Store - Phân Bón & Vật Tư" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Phone size={14}/> Điện thoại</label>
                    <input type="text" defaultValue="1900 1234" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Mail size={14}/> Email liên hệ</label>
                    <input type="email" defaultValue="contact@agristore.vn" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><MapPin size={14}/> Địa chỉ trụ sở</label>
                  <textarea rows="3" defaultValue="Khu Công Nghiệp Phú Mỹ, Phường Phú Mỹ, Thị xã Phú Mỹ, Tỉnh Bà Rịa - Vũng Tàu" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Globe size={14}/> URL Website</label>
                  <input type="text" defaultValue="https://agristore.vn" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 text-gray-500" disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Phương thức thanh toán</h3>
              <div className="space-y-4">
                <ToggleSetting title="Thanh toán khi nhận hàng (COD)" description="Cho phép khách hàng thanh toán bằng tiền mặt khi nhận hàng." checked={true} />
                <ToggleSetting title="Chuyển khoản Ngân hàng (Thủ công)" description="Hiển thị số tài khoản để khách hàng tự chuyển khoản." checked={true} />
                <ToggleSetting title="Cổng thanh toán VNPAY" description="Thanh toán qua quét mã QR hoặc thẻ ATM nội địa." checked={false} />
                <ToggleSetting title="Cổng thanh toán MoMo" description="Thanh toán bằng ví điện tử MoMo." checked={false} />
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100">Cấu hình Vận chuyển</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phí vận chuyển mặc định (VNĐ)</label>
                  <input type="number" defaultValue="30000" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Miễn phí vận chuyển cho đơn hàng từ (VNĐ)</label>
                  <input type="number" defaultValue="1000000" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                  <p className="text-xs text-gray-500 mt-1">Để trống hoặc 0 nếu không áp dụng freeship tự động.</p>
                </div>
                <ToggleSetting title="Tích hợp Giao Hàng Tiết Kiệm (GHTK)" description="Tự động đẩy đơn hàng qua hệ thống GHTK." checked={false} />
              </div>
            </div>
          )}

          {/* Các tab khác có thể phát triển thêm tương tự */}
          {(activeTab === 'notifications' || activeTab === 'account') && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Store size={48} className="mb-4 opacity-20" />
              <p>Module đang trong quá trình phát triển.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Sub Component
function TabMenu({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-white hover:text-gray-900'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ToggleSetting({ title, description, checked }) {
  const [isOn, setIsOn] = useState(checked);
  return (
    <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed max-w-md">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-green-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}