// src/admin/pages/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-green-700">Tổng doanh thu</h3>
          <p className="text-2xl font-bold mt-2">1.200.000đ</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-green-700">Đơn hàng hôm nay</h3>
          <p className="text-2xl font-bold mt-2">35</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-bold text-green-700">Khách hàng mới</h3>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;