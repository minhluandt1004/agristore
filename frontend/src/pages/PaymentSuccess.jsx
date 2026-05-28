// src/pages/PaymentSuccess.jsx
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <CheckCircle2 size={80} className="text-green-600 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h1>
      <p className="text-gray-700 mb-6">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition"
      >
        Quay về trang chủ
      </button>
    </div>
  );
}