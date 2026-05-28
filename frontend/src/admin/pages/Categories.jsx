import React, { useState } from "react";
import { 
  Plus, Search, Edit, Trash2, X, 
  Folder, FolderOpen, CornerDownRight, Layers, Tag
} from "lucide-react";

// ==========================================
// DỮ LIỆU MẪU (MOCK DATA)
// Sắp xếp theo thứ tự Cha -> Các con
// ==========================================
const mockCategories = [
  { id: 1, parentId: null, name: "Phân bón", slug: "phan-bon", productCount: 150 },
  { id: 2, parentId: 1, name: "Phân bón vô cơ (NPK, DAP)", slug: "phan-bon-vo-co", productCount: 85 },
  { id: 3, parentId: 1, name: "Phân bón hữu cơ", slug: "phan-bon-huu-co", productCount: 65 },
  { id: 4, parentId: null, name: "Thuốc bảo vệ thực vật", slug: "thuoc-bvtv", productCount: 120 },
  { id: 5, parentId: 4, name: "Thuốc trừ sâu", slug: "thuoc-tru-sau", productCount: 50 },
  { id: 6, parentId: 4, name: "Thuốc trừ bệnh", slug: "thuoc-tru-benh", productCount: 45 },
  { id: 7, parentId: 4, name: "Thuốc trừ cỏ", slug: "thuoc-tru-co", productCount: 25 },
  { id: 8, parentId: null, name: "Dụng cụ nông nghiệp", slug: "dung-cu-nong-nghiep", productCount: 30 },
];

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" hoặc "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Mở modal Thêm mới
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Mở modal Sửa
  const handleOpenEdit = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-8 animate-fade-in relative">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h2>
          <p className="text-sm text-gray-500 mt-1">Phân loại sản phẩm theo cấu trúc thư mục</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm w-max"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 shadow-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU DANH MỤC */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-5 py-4 font-semibold w-16 text-center">ID</th>
                <th className="px-5 py-4 font-semibold">Tên danh mục</th>
                <th className="px-5 py-4 font-semibold">Đường dẫn (Slug)</th>
                <th className="px-5 py-4 font-semibold text-center">Số sản phẩm</th>
                <th className="px-5 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {mockCategories.map((category) => {
                const isParent = category.parentId === null;
                
                return (
                  <tr key={category.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-4 text-center font-medium text-gray-500">
                      #{category.id}
                    </td>
                    
                    {/* Cột Tên danh mục có xử lý lùi đầu dòng cho danh mục con */}
                    <td className="px-5 py-4">
                      <div className={`flex items-center gap-2 ${isParent ? '' : 'ml-6'}`}>
                        {isParent ? (
                          <FolderOpen size={18} className="text-amber-500" />
                        ) : (
                          <CornerDownRight size={16} className="text-gray-400" />
                        )}
                        <span className={`font-medium ${isParent ? 'text-gray-900 text-base' : 'text-gray-700'}`}>
                          {category.name}
                        </span>
                        {isParent && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">
                            Danh mục gốc
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">
                      /{category.slug}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-green-50 text-green-700 font-semibold rounded-full px-3 py-1 text-xs">
                        {category.productCount} SP
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(category)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" 
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" 
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL THÊM / SỬA DANH MỤC */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Layers size={18} className="text-green-600" />
                {modalMode === "add" ? "Thêm danh mục mới" : "Cập nhật danh mục"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  defaultValue={selectedCategory?.name || ""}
                  placeholder="VD: Phân bón vô cơ..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex justify-between">
                  <span>Đường dẫn (Slug) <span className="text-red-500">*</span></span>
                  <span className="text-xs text-gray-400 font-normal">Tự động tạo từ tên</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={selectedCategory?.slug || ""}
                    placeholder="phan-bon-vo-co"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục cha (Parent ID)</label>
                <select 
                  defaultValue={selectedCategory?.parentId || ""}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="">-- Trống (Đây là danh mục gốc) --</option>
                  <option value="1">Phân bón</option>
                  <option value="4">Thuốc bảo vệ thực vật</option>
                  <option value="8">Dụng cụ nông nghiệp</option>
                </select>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <Folder size={12} /> Để trống nếu đây là danh mục cấp 1.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
              >
                Hủy bỏ
              </button>
              <button className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm">
                {modalMode === "add" ? "Tạo danh mục" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}