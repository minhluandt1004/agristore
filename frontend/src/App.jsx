import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from "./components/ScrollToTop";
import SearchDetail from './pages/SearchDetail';

import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import NotFound from './pages/NotFound';
import VideoGallery from './pages/VideoGallery';
import VideoDetail from './pages/VideoDetail';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Category from './pages/Category';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import FloatingContact from './components/FloatingContact';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminRoute from './admin/AdminRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Toaster position="top-right" />

      <div className="min-h-screen flex flex-col bg-[#f4f7f6]">
        {/* Navbar chỉ hiển thị cho người dùng */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Navbar />} />
        </Routes>

        <main className="flex-1">
          <Routes>
            {/* Website người dùng */}
            <Route path="/" element={<Home />} />
            <Route path="/danh-muc" element={<Category />} />
            <Route path="/tin-tuc" element={<News />} />
            <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
            <Route path="/video" element={<VideoGallery />} />
            <Route path="/video/:slug" element={<VideoDetail />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/tai-khoan" element={<Profile />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />
            <Route path="/tim-kiem" element={<SearchDetail />} />
            <Route path="/gio-hang" element={<Cart />} />
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-fail" element={<PaymentFail />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<div className="text-2xl">Chào mừng đến Dashboard</div>} />
                {/* Thêm các route con sau */}
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={
            <>
              <Footer />
              <FloatingContact />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;