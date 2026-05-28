import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#022c22] text-emerald-50 pt-16 pb-8 border-t-4 border-orange-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">🌿 AGRI STORE</h3>
          <p className="text-sm text-emerald-200 leading-relaxed mb-6">Đơn vị tiên phong cung cấp giải pháp dinh dưỡng và bảo vệ thực vật chất lượng cao.</p>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-3"><MapPin size={16} className="text-orange-500"/> 70 Lữ Gia, P.15, Q.11, TP.HCM</p>
            <p className="flex items-center gap-3"><Phone size={16} className="text-orange-500"/> 0863.999.086 (Kỹ thuật)</p>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-6 uppercase">Danh mục vật tư</h4>
          <ul className="space-y-3 text-sm text-emerald-200">
            <li>Phân bón hữu cơ & Vi sinh</li>
            <li>Phân bón vô cơ (NPK, Urê)</li>
            <li>Thuốc trừ sâu bệnh</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-6 uppercase">Hỗ trợ nhà nông</h4>
          <ul className="space-y-3 text-sm text-emerald-200">
            <li>Chính sách giao hàng</li>
            <li>Hướng dẫn mua hàng</li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-6 uppercase">Đăng ký nhận ưu đãi</h4>
          <div className="flex bg-[#064e3b] rounded-lg overflow-hidden border border-emerald-800">
            <input type="email" placeholder="Email của bạn..." className="bg-transparent px-4 py-3 w-full text-sm outline-none text-white" />
            <button className="bg-orange-500 hover:bg-orange-600 px-4 font-bold transition text-sm">GỬI</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-emerald-800 text-center text-xs text-emerald-400">
        © 2026 AGRI STORE - NÔNG NGHIỆP HIỆN ĐẠI. Thiết kế giao diện độc quyền.
      </div>
    </footer>
  );
}