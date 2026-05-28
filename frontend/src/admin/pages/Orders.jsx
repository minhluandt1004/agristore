// src/admin/pages/Orders.jsx
import React, { useState } from "react";

const mockOrders = [
  { id: 1, code: "ORD001", user: "Nguyễn Văn A", total: 150000, status: "PENDING" },
  { id: 2, code: "ORD002", user: "Trần Thị B", total: 250000, status: "DELIVERING" },
];

const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Orders</h2>
      <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-green-50 text-green-700">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Code</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-green-50 transition">
                <td className="py-2 px-4">{o.id}</td>
                <td className="py-2 px-4">{o.code}</td>
                <td className="py-2 px-4">{o.user}</td>
                <td className="py-2 px-4">{o.total.toLocaleString("vi-VN")}đ</td>
                <td className="py-2 px-4">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;