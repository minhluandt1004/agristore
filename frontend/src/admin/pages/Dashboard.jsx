import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dữ liệu mô phỏng cho biểu đồ đường
const revenueData = [
  { name: '11 Ngày', value: 38000 },
  { name: '12 Ngày', value: 95000 },
  { name: '13 Ngày', value: 60000 },
  { name: '14 Ngày', value: 88000 },
  { name: '15 Ngày', value: 65000 },
  { name: '16 Ngày', value: 155000 },
  { name: '17 Ngày', value: 85000 },
  { name: '18 Ngày', value: 165000 },
  { name: '19 Ngày', value: 120000 },
];

// Dữ liệu mô phỏng cho biểu đồ tròn (Danh mục phân bón)
const categoryData = [
  { name: 'Phân Hữu Cơ', value: 400 },
  { name: 'Phân NPK', value: 300 },
  { name: 'Phân Lân', value: 200 },
  { name: 'Phân Lợ.', value: 100 },
  { name: 'Phân Xa', value: 50 },
];
const COLORS = ['#22c55e', '#84cc16', '#10b981', '#34d399', '#a3e635'];

// Component Thẻ Thống kê
const StatCard = ({ title, value, icon: Icon, trend, isPositive, isHighlighted }) => (
  <div className={`p-6 rounded-2xl border ${isHighlighted ? 'bg-green-100 border-green-200' : 'bg-white border-gray-100 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      {!isHighlighted && (
        <div className="p-3 bg-gray-50 rounded-xl">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      )}
    </div>
    <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
      <span>{trend}</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      {/* 4 Thẻ Thống Kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng Doanh Thu" value="$27,979.096" trend="↗ 7,878 (5.76%)" isPositive={true} isHighlighted={true} />
        <StatCard title="Đơn Hàng Mới" value="56" trend="↗ 6,59 (4.92%)" isPositive={true} icon={ShoppingCart} />
        <StatCard title="Số Lượng Sản Phẩm" value="146" trend="Không đổi" isPositive={true} icon={Package} />
        <StatCard title="Khách Hàng Mới" value="13" trend="↗ 2,1 (1.2%)" isPositive={true} icon={Users} />
      </div>

      {/* Khu vực Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Doanh Thu */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Xu hướng Doanh Thu Tháng 11</h3>
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 outline-none">
              <option>Tháng 11</option>
              <option>Tháng 10</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value/1000}K`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Danh Mục */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Phân Bổ Danh Mục Sản Phẩm</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm text-gray-600 font-medium">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng Đơn Hàng Gần Đây */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Đơn Hàng Gần Đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Mã Đơn</th>
                <th className="p-4 font-semibold">Tên Khách Hàng</th>
                <th className="p-4 font-semibold">Ngày</th>
                <th className="p-4 font-semibold">Tổng Tiền</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: 'M300201', name: 'Khách Hữu', date: '19/11/2023', total: '$1,400.00', status: 'Đã Giao', statusColor: 'bg-green-100 text-green-700' },
                { id: 'M300202', name: 'Phước NPK', date: '19/11/2023', total: '$6,500.00', status: 'Đang Xử Lý', statusColor: 'bg-yellow-100 text-yellow-700' },
                { id: 'M300203', name: 'Khách Ngân', date: '30/11/2023', total: '$3,000.00', status: 'Đã Hủy', statusColor: 'bg-red-100 text-red-700' },
                { id: 'M300204', name: 'Khách hàng', date: '19/11/2023', total: '$6,000.00', status: 'Đang Xử Lý', statusColor: 'bg-yellow-100 text-yellow-700' },
                { id: 'M300205', name: 'Khách hàng', date: '28/11/2023', total: '$2,500.00', status: 'Đã Giao', statusColor: 'bg-green-100 text-green-700' },
              ].map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{order.id}</td>
                  <td className="p-4 text-gray-600">{order.name}</td>
                  <td className="p-4 text-gray-500">{order.date}</td>
                  <td className="p-4 font-medium text-gray-800">{order.total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;