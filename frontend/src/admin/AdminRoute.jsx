import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  // Giả sử bạn lưu thông tin user trong Redux auth state
  // const { userInfo } = useSelector((state) => state.auth);
  
  // Dùng tạm biến này để test, khi ráp code thực tế hãy dùng logic Redux ở trên
  const isAdmin = true; 

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;