// src/pages/NotFound.jsx
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Trang bạn tìm không tồn tại.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
      >
        Quay về trang chủ
      </button>
    </div>
  );
}