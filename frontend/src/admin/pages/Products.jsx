// src/admin/pages/Products.jsx
import React, { useState } from "react";

const mockProducts = [
  { id: 1, name: "Phân bón NPK", price: 20000, stock: 100 },
  { id: 2, name: "Thuốc trừ sâu", price: 15000, stock: 50 },
];

const Products = () => {
  const [products, setProducts] = useState(mockProducts);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Products</h2>
      <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-green-50 text-green-700">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-green-50 transition">
                <td className="py-2 px-4">{p.id}</td>
                <td className="py-2 px-4">{p.name}</td>
                <td className="py-2 px-4">{p.price.toLocaleString("vi-VN")}đ</td>
                <td className="py-2 px-4">{p.stock}</td>
                <td className="py-2 px-4 flex gap-2 justify-center">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;