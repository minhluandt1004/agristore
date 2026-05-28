import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Kiểm tra xem có dữ liệu admin trong localStorage không
  const adminData = localStorage.getItem('admin');
  
  // Nếu có thì cho phép truy cập các Route con (Outlet), nếu không thì đẩy về trang Login
  return adminData ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;