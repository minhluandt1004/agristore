import React, { useState } from "react";
import { 
  TrendingUp, Users, ShoppingBag, BarChart3, 
  Download, Calendar, Target, Map, PieChart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Đăng ký Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const [range, setRange] = useState('30d');

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // ==========================================
  // CONFIG BIỂU ĐỒ 1: DOANH THU & LỢI NHUẬN (COMBINED CHART)
  // ==========================================
  const revenueProfitData = {
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6"],
    datasets: [
      {
        type: 'line',
        label: 'Biên lợi nhuận (%)',
        data: [25, 28, 26, 30, 32, 29],
        borderColor: '#f59e0b', // Màu cam
        backgroundColor: '#f59e0b',
        borderWidth: 2,
        yAxisID: 'y1',
        tension: 0.4,
      },
      {
        type: 'bar',
        label: 'Doanh thu (Triệu VNĐ)',
        data: [450, 520, 380, 650, 720, 590],
        backgroundColor: 'rgba(22, 163, 74, 0.8)', // Xanh lá
        borderRadius: 4,
        yAxisID: 'y',
      }
    ]
  };

  const revenueProfitOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: { backgroundColor: "rgba(17, 24, 39, 0.9)", padding: 12 }
    },
    scales: {
      y: { type: 'linear', display: true, position: 'left', grid: { color: "#f3f4f6" }, border: { display: false } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, border: { display: false }, min: 0, max: 100 },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  // ==========================================
  // CONFIG BIỂU ĐỒ 2: DOANH SỐ THEO KHU VỰC (HORIZONTAL BAR)
  // ==========================================
  const regionData = {
    labels: ["Đồng Tháp", "An Giang", "Tiền Giang", "Long An", "Kiên Giang"],
    datasets: [{
      label: 'Doanh số (Triệu VNĐ)',
      data: [320, 280, 210, 150, 90],
      backgroundColor: '#3b82f6', // Xanh dương
      borderRadius: 4,
      barThickness: 20,
    }]
  };

  const regionOptions = {
    indexAxis: 'y', // Chuyển thành biểu đồ ngang
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#f3f4f6" }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false } }
    }
  };

  // ==========================================
  // CONFIG BIỂU ĐỒ 3: HÀNH VI MUA HÀNG (DOUGHNUT)
  // ==========================================
  const customerBehaviorData = {
    labels: ["Khách mua lần đầu", "Khách quay lại (Loyal)", "Khách sỉ (Đại lý)"],
    datasets: [{
      data: [45, 40, 15],
      backgroundColor: ["#10b981", "#8b5cf6", "#f43f5e"],
      borderWidth: 0,
      cutout: '75%',
    }]
  };

  return (
    <div className="pb-8 animate-fade-in relative">
      
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Phân tích & Báo cáo chuyên sâu</h2>
          <p className="text-sm text-gray-500 mt-1">Đo lường hiệu quả kinh doanh và xu hướng thị trường</p>
        </div>
        
        {/* Bộ lọc thời gian nâng cao */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
          {[
            { id: '7d', label: '7 Ngày' },
            { id: '30d', label: '30 Ngày' },
            { id: '90d', label: '3 Tháng' },
            { id: '1y', label: '1 Năm' }
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => setRange(btn.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                range === btn.id ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button className="px-3 py-1.5 text-gray-600 hover:text-green-700 transition flex items-center gap-2 text-sm font-medium">
            <Download size={16} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* CÁC CHỈ SỐ KINH DOANH CỐT LÕI (CORE METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Tỉ lệ chuyển đổi (CR)" 
          value="4.2%" 
          trend="+0.5%" 
          isPositive={true} 
          icon={<Target size={20} />} 
          color="blue"
          subtext="Lượt truy cập -> Đơn hàng"
        />
        <MetricCard 
          title="Giá trị đơn trung bình (AOV)" 
          value="1.850.000đ" 
          trend="+12%" 
          isPositive={true} 
          icon={<ShoppingBag size={20} />} 
          color="green"
          subtext="Tăng nhờ combo NPK"
        />
        <MetricCard 
          title="Tỉ lệ khách quay lại" 
          value="38.5%" 
          trend="-2.1%" 
          isPositive={false} 
          icon={<Users size={20} />} 
          color="purple"
          subtext="Cần đẩy mạnh CSKH vụ mới"
        />
        <MetricCard 
          title="Chi phí trên mỗi đơn (CPA)" 
          value="45.000đ" 
          trend="-5%" 
          isPositive={true} 
          icon={<TrendingUp size={20} />} 
          color="amber"
          subtext="Chi phí quảng cáo tối ưu hơn"
        />
      </div>

      {/* KHU VỰC BIỂU ĐỒ CHÍNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Biểu đồ 1: Doanh thu & Biên lợi nhuận (Chiếm 2/3) */}
        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-green-600"/> Tương quan Doanh thu & Biên lợi nhuận
            </h3>
          </div>
          <div className="relative flex-1 min-h-[320px] w-full">
            <Bar data={revenueProfitData} options={revenueProfitOptions} />
          </div>
        </div>

        {/* Biểu đồ 2: Cơ cấu khách hàng (Chiếm 1/3) */}
        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl lg:col-span-1 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-purple-600"/> Cơ cấu tệp khách hàng
          </h3>
          <div className="relative flex-1 min-h-[200px] w-full flex justify-center">
            <Doughnut data={customerBehaviorData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } } } }} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed text-center">
              Khách quay lại chiếm <span className="font-bold text-gray-900">40%</span>. Đây là tín hiệu cực tốt cho thấy chất lượng phân bón đạt chuẩn.
            </p>
          </div>
        </div>

      </div>

      {/* KHU VỰC BIỂU ĐỒ PHỤ & BẢNG PHÂN TÍCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ 3: Top Khu vực */}
        <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-xl flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Map size={18} className="text-blue-600"/> Bản đồ nhiệt doanh số (Top 5 Tỉnh)
          </h3>
          <div className="relative flex-1 min-h-[280px] w-full">
            <Bar data={regionData} options={regionOptions} />
          </div>
        </div>

        {/* Bảng phân tích: Phễu chuyển đổi sản phẩm */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Target size={18} className="text-red-500"/> Hiệu suất chuyển đổi theo sản phẩm
            </h3>
          </div>
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="px-4 py-3 font-semibold">Tên Sản Phẩm</th>
                  <th className="px-4 py-3 font-semibold text-right">Lượt xem</th>
                  <th className="px-4 py-3 font-semibold text-right">Thêm giỏ</th>
                  <th className="px-4 py-3 font-semibold text-right">Tỉ lệ chốt</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">Đạm Cà Mau (50kg)</td>
                  <td className="px-4 py-3 text-right text-gray-600">12,450</td>
                  <td className="px-4 py-3 text-right text-gray-600">3,200</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">8.5%</td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">Thuốc trừ sâu Regent</td>
                  <td className="px-4 py-3 text-right text-gray-600">8,120</td>
                  <td className="px-4 py-3 text-right text-gray-600">1,500</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">6.2%</td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">Phân bón lá Growmore</td>
                  <td className="px-4 py-3 text-right text-gray-600">15,000</td>
                  <td className="px-4 py-3 text-right text-gray-600">800</td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">2.1%</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">Hữu cơ Nhật Bản (25kg)</td>
                  <td className="px-4 py-3 text-right text-gray-600">5,400</td>
                  <td className="px-4 py-3 text-right text-gray-600">1,100</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">12.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: THẺ CHỈ SỐ
// ==========================================
function MetricCard({ title, value, trend, isPositive, icon, color, subtext }) {
  const bgColors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 p-5 rounded-xl">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-400">{subtext}</p>
      </div>
    </div>
  );
}