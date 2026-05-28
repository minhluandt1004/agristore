import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Auth
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Promotions from './pages/Promotions';
import Posts from './pages/Posts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        {/* Route đăng nhập không cần bảo vệ */}
        <Route path="login" element={<AdminLogin />} />

        {/* Các Route cần bảo vệ (Phải đăng nhập mới vào được) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="categories" element={<Categories />} />
            <Route path="customers" element={<Customers />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="posts" element={<Posts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AdminApp;