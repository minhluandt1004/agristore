import React, { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Search, Eye, Printer, Trash2, X, 
  MapPin, CreditCard, User, Clock, CheckCircle2, 
  Truck, Package, AlertCircle, FileText, Download, ChevronRight,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // State lọc trạng thái thật
  const [filterDate, setFilterDate] = useState("");     // State lọc ngày thật
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Quy định số đơn hàng hiển thị trên 1 trang

  // Hệ thống thông báo Toast thay thế alert()
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // 1. Tải danh sách đơn hàng thật từ Backend
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8080/api/v1/orders/admin/all");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        triggerToast("Không thể tải danh sách đơn hàng từ máy chủ", "error");
      }
    } catch (err) { 
      console.error("Lỗi tải đơn hàng:", err);
      triggerToast("Lỗi kết nối đến Backend", "error");
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // Reset trang về 1 mỗi khi thay đổi điều kiện tìm kiếm hoặc bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDate]);

  // 2. Hàm cập nhật trạng thái đơn hàng (Có window.confirm an toàn)
  const handleUpdateStatus = async (orderId, newStatus) => {
    let confirmMessage = "";
    switch (newStatus) {
      case 'CANCELLED':
        confirmMessage = `Hành động này sẽ HỦY đơn hàng ${selectedOrder?.orderCode} và HOÀN TRẢ lại số lượng tồn kho cho sản phẩm. Bạn có chắc chắn muốn hủy không?`;
        break;
      case 'PROCESSING':
        confirmMessage = "Bạn có chắc chắn muốn DUYỆT ĐƠN và bắt đầu chuẩn bị đóng gói hàng không?";
        break;
      case 'SHIPPING':
        confirmMessage = "Xác nhận đã đóng gói xong và BÀN GIAO kiện hàng cho xe vận chuyển trung chuyển?";
        break;
      case 'COMPLETED':
        confirmMessage = "Xác nhận đơn hàng đã ĐẦY ĐỦ THỦ TỤC và giao sạch thành công tới tay nông dân?";
        break;
      default:
        confirmMessage = "Bạn có chắc chắn muốn thay đổi trạng thái của đơn hàng này không?";
    }

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`http://localhost:8080/api/v1/orders/${orderId}/status?status=${newStatus}`, {
        method: "POST"
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        setOrders(prev => prev.map(o => o.orderId === orderId ? updatedData : o));
        setSelectedOrder(updatedData);
        triggerToast(`Cập nhật trạng thái đơn hàng thành công!`, "success");
        setIsModalOpen(false);
      } else {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.message || "Hệ thống từ chối cập nhật trạng thái này.";
        triggerToast(errMsg, "error");
      }
    } catch (err) { 
      triggerToast("Lỗi mạng, không thể gửi yêu cầu đi", "error"); 
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  // Khối định nghĩa trọng số ưu tiên sắp xếp
  const getStatusPriority = (status) => {
    if (status === 'PENDING') return 1;    // Chờ duyệt xếp đầu tiên
    if (status === 'SHIPPING') return 2;   // Đang giao xếp thứ hai
    return 3;                              // Các trạng thái còn lại gom nhóm phía sau
  };

  // 3. XỬ LÝ TOÀN BỘ LOGIC: LỌC KIẾM, LỌC TRẠNG THÁI, LỌC NGÀY VÀ SẮP XẾP ƯU TIÊN ĐẶC BIỆT
  const processedOrders = useMemo(() => {
    // A. Thực hiện Filter (Lọc) dữ liệu trước
    let result = orders.filter(o => {
      const matchSearch = o.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.receiverPhone?.toLowerCase().includes(searchTerm.toLowerCase());
                          
      const matchStatus = filterStatus === "" || o.orderStatus === filterStatus;
      
      let matchDate = true;
      if (filterDate) {
        // Cắt chuỗi để so sánh chính xác định dạng YYYY-MM-DD từ DB
        const orderDateStr = o.createdAt ? o.createdAt.substring(0, 10) : "";
        matchDate = orderDateStr === filterDate;
      }

      return matchSearch && matchStatus && matchDate;
    });

    // B. Thực hiện Sắp xếp (Sort) theo luật yêu cầu
    return result.sort((a, b) => {
      const priorityA = getStatusPriority(a.orderStatus);
      const priorityB = getStatusPriority(b.orderStatus);

      // Luật 1: So sánh theo mức độ ưu tiên trạng thái đặc biệt trước
      if (priorityA !== priorityB) {
        return priorityA - priorityB; 
      }

      // Luật 2: Nếu cùng mức ưu tiên nhóm 3 (Không phải PENDING hay SHIPPING), sắp xếp tăng dần bảng chữ cái (A-Z)
      if (priorityA === 3 && priorityB === 3 && a.orderStatus !== b.orderStatus) {
        return a.orderStatus.localeCompare(b.orderStatus);
      }

      // Luật 3: Nếu trùng khít toàn bộ luật trên, đơn nào có ngày tạo mới nhất (Mới đặt) sẽ đứng lên trước
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [orders, searchTerm, filterStatus, filterDate]);

  // C. Cắt mảng dữ liệu phục vụ phân trang ở Frontend
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [processedOrders, currentPage]);

  return (
    <div className="pb-8 animate-fade-in relative p-1">
      
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h2>
          <p className="text-sm text-gray-500 mt-1">
            Hiển thị {processedOrders.length} đơn hàng trên toàn bộ hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Download size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* THANH CÔNG CỤ (TOOLBAR CẢI TIẾN) */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm mã đơn, tên KH, số điện thoại..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Bộ lọc trạng thái kích hoạt thật */}
          <select 
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt </option>
            <option value="PROCESSING">Đang chuẩn bị </option>
            <option value="SHIPPING">Đang vận chuyển </option>
            <option value="COMPLETED">Hoàn thành </option>
            <option value="CANCELLED">Đã hủy bỏ </option>
          </select>
          {/* Bộ lọc theo ngày tháng kích hoạt thật */}
          <div className="relative flex items-center">
            <DatePicker
              selected={filterDate ? new Date(filterDate) : null}
              onChange={(date) => {
                // Chuyển từ Date object về định dạng YYYY-MM-DD để khớp với logic cũ của bạn
                if (!date) {
                  setFilterDate("");
                } else {
                  const formattedDate = date.toISOString().split('T')[0];
                  setFilterDate(formattedDate);
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày..."
              isClearable // Tự động có nút xóa (X) khi đã chọn
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer w-40"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐƠN HÀNG */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-14 text-center text-gray-500 font-medium flex items-center justify-center gap-2">
              <Clock className="animate-spin text-green-600" size={20}/> Đang nạp cơ sở dữ liệu đơn hàng...
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                    <th className="px-5 py-4 font-semibold w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-green-600" /></th>
                    <th className="px-5 py-4 font-semibold">Mã Đơn / Ngày đặt</th>
                    <th className="px-5 py-4 font-semibold">Người nhận</th>
                    <th className="px-5 py-4 font-semibold">Tổng số tiền</th>
                    <th className="px-5 py-4 text-center font-semibold">Thanh toán</th>
                    <th className="px-5 py-4 text-center font-semibold">Trạng thái vận đơn</th>
                    <th className="px-5 py-4 text-center font-semibold">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="px-5 py-4">
                        <p onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="font-bold text-blue-600 cursor-pointer hover:text-blue-800 hover:underline mb-0.5">{order.orderCode}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 mb-0.5">{order.receiverName || "Khách vãng lai"}</p>
                        <p className="text-xs text-gray-500">{order.receiverPhone || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-4 text-center"><PaymentStatusBadge status={order.paymentStatus} /></td>
                      <td className="px-5 py-4 text-center"><OrderStatusBadge status={order.orderStatus} /></td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"><Eye size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-400 italic">Hệ thống không tìm thấy hóa đơn tương thích.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ĐOẠN MÃ ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION BAR) */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 font-medium">
                    Đang hiển thị trang <span className="font-bold text-gray-700">{currentPage}</span> trên tổng số <span className="font-bold text-gray-700">{totalPages}</span> trang dữ liệu
                  </p>
                  <div className="flex items-center gap-1">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-white transition bg-gray-50 disabled:opacity-40 text-gray-600"
                    >
                      <ChevronLeft size={16}/>
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all ${
                            currentPage === pageNum 
                              ? "bg-green-700 text-white border-green-700 shadow-sm" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-white transition bg-gray-50 disabled:opacity-40 text-gray-600"
                    >
                      <ChevronRightIcon size={16}/>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">Chi tiết vận đơn: <span className="text-blue-600">{selectedOrder.orderCode}</span></h3>
                <OrderStatusBadge status={selectedOrder.orderStatus} />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KHỐI TRÁI: Sản phẩm đặt mua */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/40">
                      <Package size={18} className="text-emerald-600"/>
                      <h4 className="font-bold text-gray-700">Kiện hàng chi tiết ({selectedOrder.items?.length || 0})</h4>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3">Danh mục sản phẩm</th>
                          <th className="px-5 py-3 text-center">Đơn giá</th>
                          <th className="px-5 py-3 text-center">Số lượng</th>
                          <th className="px-5 py-3 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100 bg-white">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={item.variantId || index}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img src={item.image} alt="thumb" className="w-10 h-10 object-cover rounded border border-gray-100" />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-800">{item.name}</p>
                                  <p className="text-xs text-gray-400 font-medium">Quy cách: {item.weightVolume || "Mặc định"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center font-medium text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-5 py-3 text-center font-bold text-gray-800">{item.quantity}</td>
                            <td className="px-5 py-3 text-right font-bold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex justify-end">
                    <div className="w-full max-w-sm space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600 font-medium">
                        <span>Giá tạm tính:</span>
                        <span className="text-gray-800 font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Cước phí vận chuyển:</span>
                        <span className="text-gray-800 font-semibold">{formatCurrency(selectedOrder.shippingFee)}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-base">Tổng thực thu:</span>
                        <span className="font-black text-green-700 text-xl">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KHỐI PHẢI: Địa chỉ nhận hàng */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <User size={18} className="text-blue-600"/> Khách nhận & Địa chỉ
                    </h4>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Họ tên & Điện thoại:</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedOrder.receiverName || "N/A"} — {selectedOrder.receiverPhone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Tuyến đường giao hàng:</p>
                      <p className="text-sm text-gray-700 font-medium flex items-start gap-1">
                        <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                    {selectedOrder.note && (
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Ghi chú từ nông dân:</p>
                        <p className="text-sm text-amber-700 bg-amber-50/60 p-2 rounded border border-amber-100/70 flex items-start gap-1 font-medium italic">
                          <FileText size={14} className="shrink-0 mt-0.5 text-amber-600"/> "{selectedOrder.note}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                      <CreditCard size={18} className="text-purple-600"/> Cấu trúc giao dịch
                    </h4>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cổng thanh toán:</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedOrder.paymentMethodName || "Chưa tích hợp"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Đối chiếu dòng tiền:</p>
                      <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              {selectedOrder.orderStatus !== 'COMPLETED' && selectedOrder.orderStatus !== 'CANCELLED' ? (
                <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'CANCELLED')} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm flex items-center gap-2 font-bold transition-all border border-red-200">
                  <Trash2 size={16} /> Hủy bỏ đơn
                </button>
              ) : <div />}
              
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition-colors">Đóng tab</button>
                
                {selectedOrder.orderStatus === 'PENDING' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'PROCESSING')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all">Xác nhận đơn hàng</button>
                )}
                {selectedOrder.orderStatus === 'PROCESSING' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'SHIPPING')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all">Bàn giao xe trung chuyển</button>
                )}
                {selectedOrder.orderStatus === 'SHIPPING' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.orderId, 'COMPLETED')} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all">Xác nhận đã giao sạch</button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TOAST SYSTEM TRÊN GÓC PHẢI */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-sm transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`} style={{ animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          {toast.type === "success" ? (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-bold">✓</div>
          ) : (
            <AlertCircle size={20} className="text-red-500 shrink-0" />
          )}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-400 hover:text-gray-600 ml-auto pl-1">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}

// ==========================================
// CÁC SUB-COMPONENT PHỤ TRỢ (BADGE STATUS)
// ==========================================
function OrderStatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 border border-green-200"><CheckCircle2 size={12}/> Hoàn thành</span>;
    case 'PENDING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200"><Clock size={12}/> Chờ duyệt</span>;
    case 'PROCESSING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700 border border-blue-200"><Package size={12}/> Đang chuẩn bị</span>;
    case 'SHIPPING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200"><Truck size={12}/> Đang vận chuyển</span>;
    case 'CANCELLED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 border border-red-200"><AlertCircle size={12}/> Đã hủy bỏ</span>;
    default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
  }
}

function PaymentStatusBadge({ status }) {
  if (status === 'PAID') {
    return <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 border border-green-200">Đã quyết toán</span>;
  }
  return <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-500 border border-gray-200">Chưa thanh toán</span>;
}