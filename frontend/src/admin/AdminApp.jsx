import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout'; // Theo đúng hình ảnh bạn gửi
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';

function AdminApp() {
  return (
    // Bắt buộc phải có basename="/admin" để router tự động hiểu tiền tố này
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Mặc định vào /admin sẽ render Dashboard */}
          <Route index element={<Dashboard />} /> 
          
          {/* Vào /admin/products sẽ render Products */}
          <Route path="products" element={<Products />} /> 
          
          {/* Vào /admin/orders sẽ render Orders */}
          <Route path="orders" element={<Orders />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AdminApp;