import React, { useState } from "react";
import { 
  Plus, Search, Edit, Trash2, Eye, X, 
  FileText, PlayCircle, Image as ImageIcon,
  CheckCircle2, AlertCircle, Link as LinkIcon,
  Calendar, User, BarChart
} from "lucide-react";

// ==========================================
// DỮ LIỆU MẪU (MOCK DATA)
// ==========================================
const mockPosts = [
  {
    id: 1,
    title: "Kỹ thuật bón phân NPK cho lúa vụ Đông Xuân",
    slug: "ky-thuat-bon-phan-npk-lua-dong-xuan",
    category: "Kỹ thuật canh tác",
    postType: "NEWS",
    thumbnailUrl: "https://via.placeholder.com/150",
    content: "Bón phân NPK đúng cách giúp lúa phát triển mạnh mẽ, hạt lép ít. Trong vụ Đông Xuân, thời tiết lạnh nên cần tăng cường Lân và Kali để cây cứng cáp...",
    author: { fullName: "Admin Nông Nghiệp" },
    isPublished: true,
    viewCount: 1254,
    createdAt: "2026-05-10T08:00:00"
  },
  {
    id: 2,
    title: "Hướng dẫn pha thuốc trừ sâu an toàn, hiệu quả",
    slug: "huong-dan-pha-thuoc-tru-sau",
    category: "Video hướng dẫn",
    postType: "VIDEO",
    videoType: "YOUTUBE",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: "Video hướng dẫn chi tiết cách trang bị đồ bảo hộ và pha thuốc trừ sâu đúng liều lượng, đảm bảo an toàn sức khỏe cho người nông dân.",
    thumbnailUrl: null,
    author: { fullName: "Kỹ sư Lê Hùng" },
    isPublished: true,
    viewCount: 3420,
    createdAt: "2026-05-15T14:30:00"
  },
  {
    id: 3,
    title: "Thị trường phân bón tháng 5/2026 có biến động mạnh",
    slug: "thi-truong-phan-bon-thang-5-2026",
    category: "Tin thị trường",
    postType: "NEWS",
    thumbnailUrl: null,
    content: "Do ảnh hưởng của chuỗi cung ứng toàn cầu, giá phân bón Urea và DAP có dấu hiệu tăng nhẹ vào đầu tháng...",
    author: { fullName: "Admin Nông Nghiệp" },
    isPublished: false,
    viewCount: 0,
    createdAt: "2026-05-25T09:15:00"
  }
];

export default function Posts() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho Modal "Thêm/Sửa bài viết"
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [postTypeForm, setPostTypeForm] = useState("NEWS");

  // State cho Modal "Xem chi tiết"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  // Hàm mở modal xem chi tiết
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  return (
    <div className="pb-8 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bài viết & Video (Blog)</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý tin tức, kiến thức nông nghiệp và video hướng dẫn</p>
        </div>
        <button 
          onClick={() => setIsFormModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm"
        >
          <Plus size={16} /> Viết bài mới
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
            <option value="">Tất cả loại hình</option>
            <option value="NEWS">Bài viết (Tin tức/Kiến thức)</option>
            <option value="VIDEO">Video hướng dẫn</option>
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-5 py-4 font-semibold">Nội dung</th>
                <th className="px-5 py-4 font-semibold">Chuyên mục & Tác giả</th>
                <th className="px-5 py-4 font-semibold text-center">Lượt xem</th>
                <th className="px-5 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-5 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {mockPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {post.thumbnailUrl ? (
                          <img src={post.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                        {post.postType === "VIDEO" && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <PlayCircle size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        {/* GẮN SỰ KIỆN CLICK VÀO TIÊU ĐỀ */}
                        <p 
                          onClick={() => handleViewPost(post)}
                          className="font-semibold text-gray-800 text-sm mb-1 hover:text-green-700 cursor-pointer transition-colors line-clamp-2"
                        >
                          {post.title}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          post.postType === "VIDEO" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {post.postType === "VIDEO" ? <PlayCircle size={10}/> : <FileText size={10}/>} {post.postType}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{post.category}</p>
                    <p className="text-xs text-gray-500">{post.author.fullName} • {formatDate(post.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-gray-600">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {post.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12}/> Xuất bản
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        <AlertCircle size={12}/> Bản nháp
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* GẮN SỰ KIỆN CLICK VÀO NÚT XEM */}
                      <button 
                        onClick={() => handleViewPost(post)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" 
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition" title="Chỉnh sửa"><Edit size={18} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" title="Xóa"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL 1: XEM CHI TIẾT BÀI VIẾT (VIEW DETAILS) */}
      {/* ========================================== */}
      {isViewModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {selectedPost.postType === "VIDEO" ? <PlayCircle size={18} className="text-red-500"/> : <FileText size={18} className="text-blue-500"/>}
                Xem trước nội dung
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{selectedPost.title}</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1"><User size={14}/> {selectedPost.author.fullName}</span>
                <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(selectedPost.createdAt)}</span>
                <span className="flex items-center gap-1"><BarChart size={14}/> {selectedPost.viewCount} lượt xem</span>
                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{selectedPost.category}</span>
              </div>

              {/* Nếu là Video -> Hiển thị khung Video */}
              {selectedPost.postType === "VIDEO" && selectedPost.videoUrl && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                  <PlayCircle size={48} className="text-red-500 mb-2 opacity-80" />
                  <p className="text-gray-600 mb-1">Video YouTube / Vimeo đã được nhúng tại đây</p>
                  <a href={selectedPost.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    {selectedPost.videoUrl}
                  </a>
                </div>
              )}

              {/* Ảnh Thumbnail nếu có */}
              {selectedPost.thumbnailUrl && selectedPost.postType === "NEWS" && (
                <div className="mb-6 rounded-xl overflow-hidden bg-gray-100 max-h-64 flex justify-center border border-gray-100">
                  <img src={selectedPost.thumbnailUrl} alt="Cover" className="object-cover w-full h-full" />
                </div>
              )}

              {/* Nội dung bài viết */}
              <div className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">
                {selectedPost.content || "Chưa có nội dung mô tả chi tiết."}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">Đóng</button>
              <button className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm flex items-center gap-2">
                <Edit size={16} /> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: THÊM BÀI VIẾT/VIDEO (CREATE FORM) */}
      {/* ========================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Tạo nội dung mới</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Chọn loại nội dung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại nội dung</label>
                <div className="flex gap-4">
                  <label className={`flex flex-1 items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${postTypeForm === 'NEWS' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}>
                    <input type="radio" name="postType" value="NEWS" checked={postTypeForm === 'NEWS'} onChange={() => setPostTypeForm('NEWS')} className="text-green-600 focus:ring-green-500 w-4 h-4"/>
                    <FileText className={postTypeForm === 'NEWS' ? 'text-green-600' : 'text-gray-400'}/>
                    <div><p className="font-bold text-gray-800 text-sm">Bài viết (News)</p><p className="text-xs text-gray-500">Tin tức, kiến thức, mẹo vặt</p></div>
                  </label>
                  <label className={`flex flex-1 items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${postTypeForm === 'VIDEO' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>
                    <input type="radio" name="postType" value="VIDEO" checked={postTypeForm === 'VIDEO'} onChange={() => setPostTypeForm('VIDEO')} className="text-red-600 focus:ring-red-500 w-4 h-4"/>
                    <PlayCircle className={postTypeForm === 'VIDEO' ? 'text-red-600' : 'text-gray-400'}/>
                    <div><p className="font-bold text-gray-800 text-sm">Video hướng dẫn</p><p className="text-xs text-gray-500">Chèn link Youtube, Vimeo</p></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nhập tiêu đề..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chuyên mục</label>
                  <input type="text" placeholder="VD: Kỹ thuật nông nghiệp" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh thu nhỏ (Thumbnail URL)</label>
                  <input type="text" placeholder="https://..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              {/* Dynamic Form dựa theo loại nội dung */}
              {postTypeForm === 'VIDEO' ? (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nền tảng (Video Type)</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none">
                      <option value="YOUTUBE">YouTube</option>
                      <option value="VIMEO">Vimeo</option>
                      <option value="LOCAL">Local / Khác</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Đường dẫn Video (URL) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
                      <input type="text" placeholder="https://youtube.com/watch?v=..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả video</label>
                    <textarea rows="3" placeholder="Nhập mô tả ngắn cho video..." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"></textarea>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung bài viết <span className="text-red-500">*</span></label>
                  <textarea rows="8" placeholder="Nhập nội dung bài viết tại đây (Hỗ trợ HTML)..." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPublished" className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer" />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 cursor-pointer">Xuất bản ngay lập tức</label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">Hủy</button>
              <button className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm">Lưu nội dung</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}