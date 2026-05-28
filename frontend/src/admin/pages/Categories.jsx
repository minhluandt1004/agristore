// src/admin/pages/Analytics.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Tháng 1", orders: 30, revenue: 1200000 },
  { name: "Tháng 2", orders: 45, revenue: 2000000 },
  { name: "Tháng 3", orders: 25, revenue: 900000 },
  { name: "Tháng 4", orders: 50, revenue: 2500000 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Doanh thu theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;