// src/pages/PaymentFail.jsx
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
      <X size={80} className="text-red-600 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thất bại</h1>
      <p className="text-gray-700 mb-6">Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại.</p>
      <button
        onClick={() => navigate('/checkout')}
        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
      >
        Quay lại Thanh toán
      </button>
    </div>
  );
}