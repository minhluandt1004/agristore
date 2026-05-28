import React, { useState } from "react";
import { 
  Plus, Search, Edit, Trash2, X, 
  Tag, Percent, Truck, Calendar, 
  Clock, CheckCircle2, AlertCircle, Copy
} from "lucide-react";

// ==========================================
// DỮ LIỆU MẪU (MOCK DATA) DỰA TRÊN CẤU TRÚC ENTITY CHUẨN
// ==========================================
const mockPromotions = [
  {
    id: 1,
    code: "XUAN2026",
    name: "Chào Hè 2026 - Giảm sâu phân bón",
    discountType: "PERCENTAGE",
    discountValue: 10, // 10%
    minOrderValue: 500000,
    maxDiscountAmount: 100000,
    usageLimit: 500,
    usedCount: 420,
    startDate: "2026-05-01T00:00:00",
    endDate: "2026-05-31T23:59:59",
    isActive: true,
  },
  {
    id: 2,
    code: "FREESHIP50K",
    name: "Miễn phí vận chuyển toàn quốc",
    discountType: "FREE_SHIPPING",
    discountValue: 50000, // Tối đa 50k
    minOrderValue: 1000000,
    maxDiscountAmount: 50000,
    usageLimit: 1000,
    usedCount: 1000,
    startDate: "2026-04-01T00:00:00",
    endDate: "2026-04-30T23:59:59",
    isActive: true, // Nhưng đã hết lượt (usedCount === usageLimit)
  },
  {
    id: 3,
    code: "KHMOI100K",
    name: "Tặng 100K cho khách hàng mới",
    discountType: "FIXED_AMOUNT",
    discountValue: 100000, // 100.000 VNĐ
    minOrderValue: 800000,
    maxDiscountAmount: 100000,
    usageLimit: 200,
    usedCount: 45,
    startDate: "2026-01-01T00:00:00",
    endDate: "2026-12-31T23:59:59",
    isActive: false, // Bị admin tạm dừng
  }
];

export default function Promotions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Xác định trạng thái của Khuyến mãi
  const getStatus = (promo) => {
    const now = new Date();
    const endDate = new Date(promo.endDate);
    
    if (!promo.isActive) return { text: "Tạm dừng", color: "bg-gray-100 text-gray-600 border-gray-200" };
    if (now > endDate) return { text: "Đã hết hạn", color: "bg-red-100 text-red-700 border-red-200" };
    if (promo.usedCount >= promo.usageLimit) return { text: "Hết lượt dùng", color: "bg-amber-100 text-amber-700 border-amber-200" };
    return { text: "Đang diễn ra", color: "bg-green-100 text-green-700 border-green-200" };
  };

  return (
    <div className="pb-8 animate-fade-in relative">
      
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Chương trình khuyến mãi</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý mã giảm giá, voucher và các chiến dịch ưu đãi</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm"
          >
            <Plus size={16} /> Tạo khuyến mãi mới
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
            placeholder="Tìm theo mã code, tên chương trình..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            <option value="">Tất cả loại</option>
            <option value="PERCENTAGE">Giảm theo %</option>
            <option value="FIXED_AMOUNT">Giảm tiền mặt</option>
            <option value="FREE_SHIPPING">Miễn phí ship</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            <option value="">Trạng thái</option>
            <option value="active">Đang diễn ra</option>
            <option value="expired">Đã kết thúc / Hết lượt</option>
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU KHUYẾN MÃI */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-5 py-4 font-semibold">Chương trình / Mã Code</th>
                <th className="px-5 py-4 font-semibold">Mức giảm & Điều kiện</th>
                <th className="px-5 py-4 font-semibold w-48">Lượt sử dụng</th>
                <th className="px-5 py-4 font-semibold text-center">Thời gian áp dụng</th>
                <th className="px-5 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {mockPromotions.map((promo) => {
                const status = getStatus(promo);
                const usePercentage = Math.round((promo.usedCount / promo.usageLimit) * 100);
                
                return (
                  <tr key={promo.id} className="hover:bg-gray-50/80 transition-colors group">
                    
                    {/* Thông tin Mã giảm giá */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 mb-1">{promo.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 font-mono font-bold text-xs rounded cursor-pointer hover:bg-gray-200" title="Click để copy">
                          <Tag size={12}/> {promo.code}
                        </span>
                      </div>
                    </td>

                    {/* Loại giảm giá & Điều kiện */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PromoTypeBadge type={promo.discountType} />
                        <span className="font-bold text-gray-900">
                          {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Đơn tối thiểu: {formatCurrency(promo.minOrderValue)}</p>
                      {promo.discountType === 'PERCENTAGE' && (
                        <p className="text-xs text-red-500 mt-0.5">Giảm tối đa: {formatCurrency(promo.maxDiscountAmount)}</p>
                      )}
                    </td>

                    {/* Thanh tiến trình sử dụng */}
                    <td className="px-5 py-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Đã dùng: <strong className="text-gray-800">{promo.usedCount}</strong></span>
                        <span className="text-gray-500">/{promo.usageLimit}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${usePercentage >= 100 ? 'bg-red-500' : usePercentage > 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
                          style={{ width: `${usePercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-right text-gray-400 mt-1">{usePercentage}%</p>
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center">
                        <p className="text-xs text-gray-600 flex items-center gap-1 mb-1"><Calendar size={12}/> {formatDate(promo.startDate)}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1"><Clock size={12}/> {formatDate(promo.endDate)}</p>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${status.color}`}>
                        {status.text}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Chỉnh sửa">
                          <Edit size={18} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL THÊM KHUYẾN MÃI (CREATE PROMO FORM) */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Tag size={18} className="text-green-600" /> Tạo chương trình khuyến mãi
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Block 1: Thông tin cơ bản */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">1. Thông tin cơ bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên chương trình <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="VD: Khuyến mãi mùa khô..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex justify-between">
                      <span>Mã Voucher (Code) <span className="text-red-500">*</span></span>
                      <button className="text-xs text-blue-600 hover:underline">Tạo ngẫu nhiên</button>
                    </label>
                    <input type="text" placeholder="VD: MUAKHO2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* Block 2: Cấu hình giảm giá */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">2. Thiết lập giảm giá</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại khuyến mãi</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                      <option value="PERCENTAGE">Giảm theo %</option>
                      <option value="FIXED_AMOUNT">Giảm tiền mặt</option>
                      <option value="FREE_SHIPPING">Miễn phí giao hàng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá trị giảm <span className="text-red-500">*</span></label>
                    <input type="number" placeholder="VD: 10 hoặc 50000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng mã tối đa</label>
                    <input type="number" placeholder="VD: 1000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn hàng tối thiểu (VNĐ)</label>
                    <input type="number" placeholder="VD: 500000" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mức giảm tối đa (VNĐ)</label>
                    <input type="number" placeholder="Áp dụng cho giảm theo %" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* Block 3: Thời gian */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">3. Thời gian áp dụng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời gian bắt đầu</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Thời gian kết thúc</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" defaultChecked className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Kích hoạt chương trình này ngay lập tức</label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
              >
                Hủy bỏ
              </button>
              <button className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm">
                Lưu khuyến mãi
              </button>
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

function PromoTypeBadge({ type }) {
  switch (type) {
    case 'PERCENTAGE': return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-purple-100 text-purple-700" title="Giảm theo phần trăm"><Percent size={14}/></span>;
    case 'FIXED_AMOUNT': return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-700" title="Giảm tiền mặt"><span className="text-xs font-bold">đ</span></span>;
    case 'FREE_SHIPPING': return <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-teal-100 text-teal-700" title="Miễn phí vận chuyển"><Truck size={14}/></span>;
    default: return null;
  }
}