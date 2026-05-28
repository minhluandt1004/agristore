import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Package, Users, DollarSign, ShoppingCart,
  FileText, AlertCircle, CheckCircle2, Clock, Download, AlertTriangle, History
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ArcElement);

export default function Dashboard() {
  const [revenueTimeRange, setRevenueTimeRange] = useState("6months");
  
  // STATE CHỨA DỮ LIỆU TỔNG HỢP TỪ API BACKEND
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setIsLoading(true);
        // Gọi 1 API duy nhất để lấy toàn bộ dữ liệu tổng hợp
        const res = await fetch('http://localhost:8080/api/v1/admin/dashboard/summary');
        
        if (!res.ok) throw new Error("Không thể kết nối đến máy chủ");
        
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardSummary();
  }, []);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-green-700 space-y-4">
        <svg className="animate-spin h-10 w-10 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span className="font-medium text-lg">Đang đồng bộ dữ liệu hệ thống...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3 mt-6">
        <AlertCircle size={24} /> 
        <div>
          <h3 className="font-bold">Lỗi tải dữ liệu</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Dữ liệu Chart từ Backend trả về
  const dynamicLineChartData = {
    labels: dashboardData?.chartData?.labels || [],
    datasets: [{
      label: "Doanh thu (Triệu VNĐ)",
      data: dashboardData?.chartData?.revenueData || [],
      borderColor: "#16a34a",
      backgroundColor: "rgba(22, 163, 74, 0.15)", 
      fill: true, tension: 0.4, pointBackgroundColor: "#fff", pointBorderColor: "#16a34a", pointBorderWidth: 2,
    }],
  };

  const doughnutData = {
    labels: ["Đã hoàn thành", "Đang giao", "Chờ xử lý", "Đã hủy"],
    datasets: [{ data: [65, 20, 10, 5], backgroundColor: ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444"], borderWidth: 0 }],
  };

  return (
    <div className="pb-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Dữ liệu thực tế từ Database.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI CARDS THẬT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Tổng doanh thu" 
          value={formatCurrency(dashboardData?.totalRevenue)} 
          icon={<DollarSign size={24} />} color="green" trend="+12%" 
        />
        <KPICard 
          title="Đơn hàng hệ thống" 
          value={dashboardData?.totalOrders?.toLocaleString()} 
          icon={<ShoppingCart size={24} />} color="blue" 
        />
        <KPICard 
          title="Sản phẩm đang bán" 
          value={dashboardData?.totalProducts?.toLocaleString()} 
          icon={<Package size={24} />} color="amber" 
        />
        <KPICard 
          title="Bài viết & Video" 
          value={dashboardData?.totalPosts?.toLocaleString()} 
          icon={<FileText size={24} />} color="purple" 
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600"/> Biểu đồ doanh thu
            </h3>
          </div>
          <div className="relative flex-1 min-h-[280px] w-full">
            <Line data={dynamicLineChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { borderDash: [5, 5] }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } } }} />
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl lg:col-span-1 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package size={18} className="text-blue-600"/> Tỉ lệ trạng thái đơn
          </h3>
          <div className="relative flex-1 min-h-[280px] w-full">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '75%' }} />
          </div>
        </div>
      </div>

      {/* 3 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Tồn kho thấp THẬT */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500"/> Sắp hết hàng ({dashboardData?.lowStockProducts?.length || 0})
          </h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {dashboardData?.lowStockProducts?.length > 0 ? (
              dashboardData.lowStockProducts.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-lg">
                  <div className="truncate pr-2 w-full">
                    <p className="text-sm font-medium text-gray-800 truncate" title={item.name}>{item.name}</p>
                    <p className="text-xs text-red-500 mt-0.5">Kho: <span className="font-bold text-red-600">{item.stock}</span> (SKU: {item.sku})</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Tất cả sản phẩm đều đủ kho.</p>
            )}
          </div>
        </div>

        {/* Sản phẩm bán chạy THẬT */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600"/> Top bán chạy
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1">
            {dashboardData?.topSellingProducts?.length > 0 ? (
              dashboardData.topSellingProducts.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate" title={item.name}>{item.name}</p>
                    <div className="flex justify-between mt-0.5">
                      <p className="text-xs text-gray-500">Đã bán: <span className="font-bold">{item.soldQuantity}</span></p>
                      <p className="text-xs text-green-600 font-medium">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu bán hàng.</p>
            )}
          </div>
        </div>

        {/* Nhật ký hoạt động */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History size={18} className="text-purple-600"/> Nhật ký hệ thống
          </h3>
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
             <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <p className="text-xs text-gray-400 mb-0.5">Vừa xong • Hệ thống</p>
                <p className="text-sm text-gray-700">Tải dữ liệu tổng quan thành công.</p>
              </div>
          </div>
        </div>
      </div>

      {/* TABLES: Đơn hàng THẬT */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={18} className="text-green-600"/> Đơn hàng mới nhất ({dashboardData?.recentOrders?.length || 0})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider bg-white">
                <th className="px-5 py-4 font-semibold">Mã Đơn / Thời gian</th>
                <th className="px-5 py-4 font-semibold">Khách hàng</th>
                <th className="px-5 py-4 font-semibold">Tổng tiền</th>
                <th className="px-5 py-4 font-semibold text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dashboardData?.recentOrders?.length > 0 ? (
                dashboardData.recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-blue-600 mb-0.5">{order.orderCode}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">{order.customerName}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-gray-400">Chưa có đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon, color, trend, desc }) {
  const bgColors = { green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700", amber: "bg-amber-100 text-amber-700", purple: "bg-purple-100 text-purple-700" };
  return (
    <div className="bg-white shadow-sm border border-gray-100 p-5 rounded-xl hover:shadow-md transition duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend ? (
          <><TrendingUp size={16} className="text-green-500 mr-1" /><span className="text-green-600 font-medium">{trend}</span><span className="text-gray-400 ml-2">so với kỳ trước</span></>
        ) : <span className="text-gray-500">{desc}</span>}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  switch (status) {
    case 'COMPLETED': return <span className="inline-flex items-center gap-1 w-max px-2.5 py-1.5 rounded text-[11px] font-bold bg-green-100 text-green-700"><CheckCircle2 size={12}/> HOÀN THÀNH</span>;
    case 'PENDING': return <span className="inline-flex items-center gap-1 w-max px-2.5 py-1.5 rounded text-[11px] font-bold bg-yellow-100 text-yellow-700"><Clock size={12}/> CHỜ XỬ LÝ</span>;
    case 'PROCESSING': return <span className="inline-flex items-center gap-1 w-max px-2.5 py-1.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700"><Clock size={12}/> ĐANG CHUẨN BỊ</span>;
    case 'CANCELLED': return <span className="inline-flex items-center gap-1 w-max px-2.5 py-1.5 rounded text-[11px] font-bold bg-red-100 text-red-700"><AlertCircle size={12}/> ĐÃ HỦY</span>;
    default: return <span className="inline-flex items-center gap-1 w-max px-2.5 py-1.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">{status}</span>;
  }
}