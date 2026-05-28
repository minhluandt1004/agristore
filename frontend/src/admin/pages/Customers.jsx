import React, { useState } from "react";
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, X, 
  MapPin, Shield, UserCheck, UserX, Download, 
  Mail, Phone, Calendar, Star
} from "lucide-react";

// ==========================================
// DỮ LIỆU MẪU DỰA TRÊN ENTITY (MOCK DATA)
// ==========================================
const mockCustomers = [
  {
    id: 1,
    fullName: "Nguyễn Văn Lúa",
    phone: "0901234567",
    email: "nguyenvanlua@example.com",
    role: "CUSTOMER",
    isActive: true,
    isGuest: false,
    createdAt: "2023-05-12T08:30:00",
    addresses: [
      { id: 1, receiverName: "Nguyễn Văn Lúa", receiverPhone: "0901234567", fullAddress: "123 Ấp Bắc, Xã Phú Điền, Huyện Tháp Mười, Tỉnh Đồng Tháp", isDefault: true },
      { id: 2, receiverName: "Nguyễn Thị Lúa (Vợ)", receiverPhone: "0911222333", fullAddress: "Sạp 45, Chợ Nông Sản, TP. Cao Lãnh, Đồng Tháp", isDefault: false }
    ],
    orderCount: 15,
    totalSpent: 45000000
  },
  {
    id: 2,
    fullName: "Trần Thị Mai",
    phone: "0987654321",
    email: "tranmai.agri@example.com",
    role: "STAFF",
    isActive: true,
    isGuest: false,
    createdAt: "2022-11-20T14:15:00",
    addresses: [
      { id: 3, receiverName: "Trần Thị Mai", receiverPhone: "0987654321", fullAddress: "Số 45, Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM", isDefault: true }
    ],
    orderCount: 2,
    totalSpent: 1250000
  },
  {
    id: 3,
    fullName: "Khách Vãng Lai 001",
    phone: "0888999777",
    email: null,
    role: "CUSTOMER",
    isActive: true,
    isGuest: true,
    createdAt: "2023-10-25T09:00:00",
    addresses: [
      { id: 4, receiverName: "Anh Tuấn", receiverPhone: "0888999777", fullAddress: "Thôn 2, Xã Đắk R'La, Huyện Đắk Mil, Tỉnh Đắk Nông", isDefault: true }
    ],
    orderCount: 1,
    totalSpent: 450000
  },
  {
    id: 4,
    fullName: "Lê Văn Hùng (Bị khóa)",
    phone: "0977111222",
    email: "hung.le@example.com",
    role: "CUSTOMER",
    isActive: false,
    isGuest: false,
    createdAt: "2023-01-10T10:00:00",
    addresses: [],
    orderCount: 0,
    totalSpent: 0
  }
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Hàm tạo Avatar từ chữ cái đầu của tên
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="pb-8 animate-fade-in relative">
      
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý khách hàng & Người dùng</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin, phân quyền và sổ địa chỉ</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Download size={16} /> Xuất Excel
          </button>
          <button className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm">
            <Plus size={16} /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* THANH CÔNG CỤ (TOOLBAR) */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, Email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            <option value="">Tất cả phân quyền</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="STAFF">Nhân viên (Staff)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
            <option value="guest">Khách vãng lai</option>
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU KHÁCH HÀNG */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-5 py-4 font-semibold w-12 text-center">ID</th>
                <th className="px-5 py-4 font-semibold">Khách hàng</th>
                <th className="px-5 py-4 font-semibold">Liên hệ</th>
                <th className="px-5 py-4 font-semibold text-center">Phân quyền</th>
                <th className="px-5 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-center">Ngày tạo</th>
                <th className="px-5 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {mockCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  <td className="px-5 py-4 text-center text-gray-500 font-medium">
                    #{user.id}
                  </td>
                  
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0">
                        {getInitials(user.fullName)}
                      </div>
                      <div>
                        <p 
                          onClick={() => openDetailModal(user)}
                          className="font-semibold text-gray-800 mb-0.5 hover:text-green-700 cursor-pointer transition-colors"
                        >
                          {user.fullName}
                        </p>
                        {user.isGuest && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">Khách vãng lai</span>}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 mb-0.5">{user.phone}</p>
                    <p className="text-xs text-gray-500">{user.email || "Chưa có email"}</p>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-5 py-4 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                        <UserCheck size={12} /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                        <UserX size={12} /> Đã khóa
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-center text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openDetailModal(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition" title="Chỉnh sửa">
                        <Edit size={18} />
                      </button>
                      {user.isActive ? (
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="Khóa tài khoản">
                          <UserX size={18} />
                        </button>
                      ) : (
                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition" title="Mở khóa tài khoản">
                          <UserCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL CHI TIẾT KHÁCH HÀNG */}
      {/* ========================================== */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Hồ sơ khách hàng</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột Trái: Thông tin cơ bản */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Card Profile */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 text-green-700 text-2xl font-bold flex items-center justify-center mb-3">
                      {getInitials(selectedCustomer.fullName)}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.fullName}</h4>
                    <p className="text-sm text-gray-500 mb-3">ID: #{selectedCustomer.id}</p>
                    <RoleBadge role={selectedCustomer.role} />
                  </div>

                  {/* Card Contact */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h5 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Liên hệ & Hệ thống</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} className="text-gray-400" /> 
                        <span className="font-medium text-gray-800">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail size={16} className="text-gray-400" /> 
                        <span>{selectedCustomer.email || "Chưa cập nhật"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar size={16} className="text-gray-400" /> 
                        <span>Tham gia: {formatDate(selectedCustomer.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Shield size={16} className="text-gray-400" /> 
                        <span>Trạng thái: {selectedCustomer.isActive ? <span className="text-green-600 font-medium">Hoạt động</span> : <span className="text-red-600 font-medium">Đã khóa</span>}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Stats */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 bg-gradient-to-br from-green-50 to-white">
                    <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2"><Star size={16}/> Thống kê mua hàng</h5>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Tổng số đơn:</span>
                      <span className="font-bold text-gray-900">{selectedCustomer.orderCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tổng chi tiêu:</span>
                      <span className="font-bold text-green-700">{formatCurrency(selectedCustomer.totalSpent)}</span>
                    </div>
                  </div>
                </div>

                {/* Cột Phải: Sổ địa chỉ (UserAddress) */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <MapPin size={18} className="text-red-500"/> Sổ địa chỉ giao hàng
                      </h4>
                      <button className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                        <Plus size={14}/> Thêm địa chỉ
                      </button>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto space-y-4">
                      {selectedCustomer.addresses.length > 0 ? (
                        selectedCustomer.addresses.map((address) => (
                          <div key={address.id} className={`p-4 rounded-xl border ${address.isDefault ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'} relative`}>
                            {address.isDefault && (
                              <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Mặc định</span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-800">{address.receiverName}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-600 font-medium">{address.receiverPhone}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{address.fullAddress}</p>
                            
                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                              <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Chỉnh sửa</button>
                              {!address.isDefault && (
                                <>
                                  <button className="text-xs font-medium text-gray-500 hover:text-green-600">Thiết lập mặc định</button>
                                  <button className="text-xs font-medium text-red-500 hover:text-red-700 ml-auto">Xóa</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                          Khách hàng này chưa lưu địa chỉ nào.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              {selectedCustomer.isActive ? (
                <button className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium text-sm flex items-center gap-2">
                  <UserX size={16} /> Khóa tài khoản này
                </button>
              ) : (
                <button className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition font-medium text-sm flex items-center gap-2">
                  <UserCheck size={16} /> Mở khóa tài khoản
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">
                  Đóng
                </button>
                <button className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm flex items-center gap-2">
                  <Edit size={16} /> Chỉnh sửa thông tin
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CÁC SUB-COMPONENT PHỤ TRỢ (UI COMPONENT)
// ==========================================

function RoleBadge({ role }) {
  switch (role) {
    case 'ADMIN': return <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700">ADMIN</span>;
    case 'STAFF': return <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">NHÂN VIÊN</span>;
    case 'CUSTOMER': return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">KHÁCH HÀNG</span>;
    default: return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">{role}</span>;
  }
}