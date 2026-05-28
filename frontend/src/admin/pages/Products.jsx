import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { 
  Plus, Search, Edit, Trash2, Eye, 
  CheckCircle2, AlertTriangle, Download, 
  Image as ImageIcon, X, Info, Settings, FileText, Layers, Save, UploadCloud,
  ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_BASE = "http://localhost:8080/api/v1/products";
const CATEGORY_API = "http://localhost:8080/api/v1/categories";
const BRAND_API = "http://localhost:8080/api/v1/brands";

function DeleteConfirmModal({ isOpen, name, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="text-red-600" size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
        <p className="text-sm text-gray-500 mb-6">Bạn có chắc chắn muốn xóa sản phẩm <b>{name}</b> không? Dữ liệu này không thể khôi phục.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Hủy bỏ</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-md shadow-red-200">Xóa vĩnh viễn</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: "" });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formModal, setFormModal] = useState({ isOpen: false, editData: null });
  const [activeTab, setActiveTab] = useState("general");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN');

  const triggerToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  }, []);

  const loadInitialData = async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch(`${API_BASE}/all`),
        fetch(CATEGORY_API).catch(() => ({ ok: false })),
        fetch(BRAND_API).catch(() => ({ ok: false }))
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json()); 
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch (err) { 
      console.error("Lỗi tải dữ liệu:", err); 
      triggerToast("Lỗi nạp cơ sở dữ liệu hệ thống", "error");
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterBrand]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchName = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === "" || p.categoryName === filterCategory;
      const matchBrand = filterBrand === "" || p.brandName === filterBrand;
      return matchName && matchCategory && matchBrand;
    });
  }, [products, searchTerm, filterCategory, filterBrand]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);


  const initiateDelete = (product) => {
    setDeleteConfirm({ isOpen: true, id: product.id, name: product.name });
  };

  const executeDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/${deleteConfirm.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
        triggerToast(`Đã xóa sản phẩm ${deleteConfirm.name}!`, "success");
      } else {
        const data = await res.json().catch(() => ({ message: "Không thể xóa!" }));
        triggerToast(data.message || "Không thể xóa sản phẩm này!", "error");
      }
    } catch (err) {
      triggerToast("Lỗi kết nối máy chủ!", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, name: "" });
    }
  };

  const openDetailModal = async (slug) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API_BASE}/${slug}`);
      if (res.ok) {
        setSelectedProduct(await res.json());
        setActiveTab("general");
        setIsModalOpen(true);
      } else {
        triggerToast("Không thể tìm thấy thông tin chi tiết sản phẩm này", "error");
      }
    } catch (err) { 
      triggerToast("Mất kết nối tới máy chủ dữ liệu", "error");
    }
  };

  const openEditModal = async (slug) => {
    if (!slug) return;
    try {
      const res = await fetch(`${API_BASE}/${slug}`);
      if (res.ok) {
        const productDetail = await res.json();
        setIsModalOpen(false); 
        setFormModal({ isOpen: true, editData: productDetail });
      } else {
        triggerToast("Không lấy được dữ liệu chỉnh sửa của sản phẩm", "error");
      }
    } catch (err) {
      triggerToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const parentCategories = useMemo(() => Array.isArray(categories) ? categories.filter(c => !c.parentId) : [], [categories]);

  return (
    <div className="pb-8 animate-fade-in relative p-6">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500 mt-1">Đang hiển thị {filteredProducts.length} / {products.length} sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <Download size={16} /> Xuất file
          </button>
          <button onClick={() => setFormModal({ isOpen: true, editData: null })} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition shadow-sm">
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {parentCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select 
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {Array.isArray(brands) && brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-b-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y border-gray-200">
                <th className="px-5 py-4 font-semibold w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-green-600" /></th>
                <th className="px-5 py-4 font-semibold">Sản phẩm</th>
                <th className="px-5 py-4 font-semibold">Danh mục & Hãng</th>
                <th className="px-5 py-4 font-semibold text-right">Giá bán thấp nhất</th>
                <th className="px-5 py-4 text-center font-semibold">Trạng thái</th>
                <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-5 py-4 text-center"><input type="checkbox" className="rounded border-gray-300 text-green-600 cursor-pointer" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-400 shrink-0 border border-gray-200 overflow-hidden">
                        {product.primaryImageUrl && product.primaryImageUrl !== "default-image.jpg" ? (
                          <img src={product.primaryImageUrl} alt="product" className="w-full h-full object-cover" />
                        ) : <ImageIcon size={20} />}
                      </div>
                      <div>
                        <p onClick={() => openDetailModal(product.slug)} className="font-semibold text-gray-800 text-base mb-0.5 hover:text-green-700 cursor-pointer transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">Đánh giá: {product.averageRating || 0}⭐ ({product.reviewCount || 0})</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-800 font-medium mb-0.5">{product.categoryName || "Chưa phân loại"}</p>
                    <p className="text-xs text-gray-500">{product.brandName || "Chưa có hãng"}</p>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(product.minPrice)}
                  </td>
                  <td className="px-5 py-4 text-center"><span className="inline-flex items-center justify-center bg-green-100 text-green-600 rounded-full w-8 h-8"><CheckCircle2 size={18} /></span></td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openDetailModal(product.slug)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem chi tiết"><Eye size={18} /></button>
                      <button onClick={() => openEditModal(product.slug)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition" title="Chỉnh sửa"><Edit size={18} /></button>
                      <button onClick={() => initiateDelete(product)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={18} />
                      </button>

                      {/* Modal Xóa */}
                      <DeleteConfirmModal 
                        isOpen={deleteConfirm.isOpen}
                        name={deleteConfirm.name}
                        onConfirm={executeDelete}
                        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, name: "" })}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                 <tr><td colSpan="6" className="text-center py-8 text-gray-500">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500 font-medium">
                Đang hiển thị trang <span className="font-bold text-gray-700">{currentPage}</span> trên tổng số <span className="font-bold text-gray-700">{totalPages}</span> trang dữ liệu
              </p>
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white transition bg-gray-50 disabled:opacity-40 text-gray-600 shadow-sm"
                >
                  <ChevronLeft size={16}/>
                </button>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all ${
                        currentPage === pageNum 
                          ? "bg-green-700 text-white border-green-700 shadow-sm" 
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white transition bg-gray-50 disabled:opacity-40 text-gray-600 shadow-sm"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {formModal.isOpen && (
        <ProductFormModal 
          categories={categories} 
          brands={brands} 
          editData={formModal.editData}
          onClose={() => setFormModal({ isOpen: false, editData: null })} 
          onSave={(message) => { 
            setFormModal({ isOpen: false, editData: null }); 
            loadInitialData(); 
            triggerToast(message || "Đồng bộ dữ liệu sản phẩm thành công!", "success");
          }} 
          triggerToast={triggerToast}
          formatCurrency={formatCurrency}
        />
      )}
      
      {isModalOpen && selectedProduct && (
        <DetailModal 
          product={selectedProduct} 
          onClose={() => setIsModalOpen(false)} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onEdit={() => openEditModal(selectedProduct.slug)}
          formatCurrency={formatCurrency}
        />
      )}

      {toast.show && (
        <div className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-sm transition-all duration-300 ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`} style={{ animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
          {toast.type === "success" ? (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-bold">✓</div>
          ) : (
            <AlertCircle size={20} className="text-red-500 shrink-0" />
          )}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-400 hover:text-gray-600 ml-auto pl-2">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODAL FORM: CHỨA CẢ THÊM MỚI VÀ CHỈNH SỬA
// ==========================================
function ProductFormModal({ categories, brands, editData, onClose, onSave, triggerToast, formatCurrency }) {
  const isEditMode = !!editData;
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  
  const parentCategories = safeCategories.filter(c => !c.parentId);
  
  const initialData = useMemo(() => {
    if (!isEditMode || !editData.categoryName) {
      return { parentId: parentCategories.length > 0 ? parentCategories[0].id : '', childId: '' };
    }
    for (const parent of safeCategories) {
      if (parent.name === editData.categoryName) return { parentId: parent.id, childId: parent.id };
      if (parent.children) {
        const matchedChild = parent.children.find(c => c.name === editData.categoryName);
        if (matchedChild) return { parentId: parent.id, childId: matchedChild.id };
      }
    }
    return { parentId: parentCategories.length > 0 ? parentCategories[0].id : '', childId: '' };
  }, [editData, isEditMode, safeCategories, parentCategories]);

  const [selectedParentId, setSelectedParentId] = useState(initialData.parentId);

  const [formData, setFormData] = useState({
    name: editData?.name || '', 
    categoryId: initialData.childId || initialData.parentId || '', 
    brandId: safeBrands.find(b => b.name === editData?.brandName)?.id || (safeBrands.length > 0 ? safeBrands[0].id : ''), 
    shortDesc: editData?.shortDesc || '', 
    fullDesc: editData?.fullDesc || '', 
    registrationNumber: editData?.registrationNumber || '', 
    activeIngredients: editData?.activeIngredients || '', 
    formulation: editData?.formulation || '', 
    toxicityClass: editData?.toxicityClass || '', 
    phiDays: editData?.phiDays || 0,
    targetCrops: editData?.targetCrops || '', 
    usagePurpose: editData?.usagePurpose || '', 
    usageInstructions: editData?.usageInstructions || '', 
    safetyWarnings: editData?.safetyWarnings || '', 
    shelfLife: editData?.shelfLife || '', 
    dosageRate: editData?.dosageRate || '', 
    isPublished: editData?.isPublished !== undefined ? editData.isPublished : true,
    variants: editData?.variants?.length > 0 
      ? editData.variants.map(v => ({
          id: v.id || null,
          sku: v.sku || '',
          weightVolume: v.weightVolume || '',
          importPrice: v.importPrice || 0, 
          price: v.price || 0,
          oldPrice: v.oldPrice || 0,
          stockQuantity: v.stockQuantity || 0,
          imageUrl: v.imageUrl || ''
        }))
      : [{ sku: '', weightVolume: '', importPrice: 0, price: 0, oldPrice: 0, stockQuantity: 0, imageUrl: '' }]
  });

  const childCategories = useMemo(() => {
    if (!selectedParentId) return [];
    const parent = safeCategories.find(c => c.id == selectedParentId);
    return parent?.children || [];
  }, [safeCategories, selectedParentId]);

  const handleParentCategoryChange = (parentId) => {
    setSelectedParentId(parentId);
    const matchedParent = safeCategories.find(c => c.id == parentId);
    if (matchedParent?.children?.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: matchedParent.children[0].id }));
    } else {
      setFormData(prev => ({ ...prev, categoryId: parentId }));
    }
  };

  const fileInputRefs = useRef([]);
  const quillRef = useRef(null); 
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", "agri_preset");
      uploadData.append("cloud_name", "dazmjvz0t");

      try {
        triggerToast("Đang tải ảnh lên máy chủ, vui lòng đợi...", "success");
        const res = await fetch(`https://api.cloudinary.com/v1_1/dazmjvz0t/image/upload`, {
          method: "POST",
          body: uploadData
        });
        const data = await res.json();
        
        if (data.secure_url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.secure_url);
          quill.setSelection(range.index + 1);
          triggerToast("Chèn ảnh vào bài viết thành công!", "success");
        }
      } catch (err) {
        triggerToast("Lỗi mạng khi tải ảnh lên bài viết.", "error");
      }
    };
  }, [triggerToast]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'], 
        ['clean']
      ],
      handlers: {
        image: imageHandler 
      }
    }
  }), [imageHandler]);

  // ==========================================
  // HÀM HỖ TRỢ XỬ LÝ NHẬP LIỆU GIÁ TIỀN & TẠO SKU
  // ==========================================
  const formatDisplayCurrency = (val) => {
    if (val === "" || val === undefined || val === null) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCurrencyChange = (index, field, rawValue) => {
    // Chỉ giữ lại các chữ số, loại bỏ dấu phẩy do user nhập vào hoặc do format
    const numericValue = rawValue.replace(/\D/g, "");
    handleVariantChange(index, field, numericValue === "" ? "" : Number(numericValue));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };
  
  const handleAutoSKU = (index) => {
    const v = formData.variants[index];
    const baseName = formData.name || "SP";
    
    // 1. Tìm tên danh mục từ categoryId đang chọn
    // Lục trong danh mục cha trước, nếu không thấy thì lục trong children
    let catName = "CAT";
    const findCategoryName = (list) => {
      for (const cat of list) {
        if (cat.id === formData.categoryId) return cat.name;
        if (cat.children) {
          const child = cat.children.find(c => c.id === formData.categoryId);
          if (child) return child.name;
        }
      }
      return null;
    };
    const foundName = findCategoryName(safeCategories);
    if (foundName) catName = foundName;

    const getInitials = (str) => str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .split(/\s+/)
      .map(w => w.charAt(0))
      .join("")
      .toUpperCase();

    const catInit = getInitials(catName); 
    const nameInit = getInitials(baseName);
    
    // Quy cách (VD: 1KG, 500ML)
    const wv = v.weightVolume 
      ? "-" + v.weightVolume.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toUpperCase() 
      : "";
      
    // Kết quả: PBL-AT-1KG
    const newSku = `${catInit}-${nameInit}${wv}`;
    handleVariantChange(index, "sku", newSku);
  };

  const handleVariantImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    const cloudName = "dazmjvz0t"; 
    const uploadPreset = "agri_preset"; 
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append("cloud_name", cloudName);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.secure_url) {
        handleVariantChange(index, 'imageUrl', data.secure_url);
        triggerToast("Tải ảnh biến thể thành công!", "success");
      } else {
        triggerToast("Lỗi xử lý file đám mây.", "error");
      }
    } catch (err) {
      triggerToast("Gián đoạn kết nối Cloudinary.", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRefs.current[index]) fileInputRefs.current[index].value = null;
    }
  };

  const addVariant = () => setFormData({...formData, variants: [...formData.variants, { sku: '', weightVolume: '', importPrice: 0, price: 0, oldPrice: 0, stockQuantity: 0, imageUrl: '' }]});
  const removeVariant = (index) => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== index)});

  

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      triggerToast("Vui lòng không để trống tên sản phẩm!", "error");
      return;
    }
    if (!formData.categoryId) {
      triggerToast("Vui lòng cấu hình loại sản phẩm chính xác!", "error");
      return;
    }

    const extractedImages = [];
    formData.variants.forEach((v, index) => {
      if (v.imageUrl && v.imageUrl.trim() !== "") {
        extractedImages.push({ imageUrl: v.imageUrl, sku: v.sku, isPrimary: index === 0 });
      }
    });

    const url = isEditMode ? `${API_BASE}/${editData.id}` : API_BASE;
    const method = isEditMode ? 'PUT' : 'POST';
    
    const payload = {
      ...formData,
      slug: isEditMode ? editData.slug : generateSlug(formData.name) + '-' + Date.now(),
      images: extractedImages
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        onSave(isEditMode ? "Cập nhật thông tin sản phẩm thành công!" : "Thêm mới sản phẩm thành công!");
      } else {
        triggerToast("Giao dịch thất bại. Hãy kiểm tra các mã SKU trùng lặp!", "error");
      }
    } catch (err) { 
      triggerToast("Mất kết nối API Gateway.", "error"); 
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-100 w-full max-w-5xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-800">{isEditMode ? `Cập nhật: ${editData.name}` : "Thêm sản phẩm mới"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><X size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          
          {/* KHỐI 1: CƠ BẢN */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Info size={18} className="text-blue-600"/> Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Tên sản phẩm *</label>
                <input value={formData.name} className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Nhập tên sản phẩm..." onChange={e => setFormData({...formData, name: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nhóm danh mục *</label>
                <select className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={selectedParentId} onChange={e => handleParentCategoryChange(e.target.value)}>
                  <option value="" disabled>-- Chọn nhóm danh mục --</option>
                  {parentCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Loại sản phẩm *</label>
                <select className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}>
                  <option value="">-- Chọn danh mục con --</option>
                  {childCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {childCategories.length === 0 && selectedParentId && <option value={selectedParentId}>Sử dụng danh mục cha</option>}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Thương hiệu *</label>
                <select className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" value={formData.brandId} onChange={e => setFormData({...formData, brandId: Number(e.target.value)})}>
                  <option value="" disabled>-- Chọn thương hiệu --</option>
                  {safeBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Mô tả ngắn</label>
                <textarea value={formData.shortDesc} className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500" rows="2" onChange={e => setFormData({...formData, shortDesc: e.target.value})}/>
              </div>
            </div>
          </div>

          {/* KHỐI 2: PHÂN LOẠI & BIẾN THỂ (ĐÃ CÓ COMMA FORMAT VÀ TẠO TỰ ĐỘNG SKU) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layers size={18} className="text-amber-600"/> Phân loại, Giá & Hình ảnh</h3>
              <button onClick={addVariant} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition"><Plus size={16}/> Thêm phân loại</button>
            </div>
            
            <div className="space-y-4">
              {formData.variants.map((v, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                  <div className="flex flex-col items-center gap-2 w-full md:w-32">
                    <div className="w-full aspect-square shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative shadow-sm">
                      {v.imageUrl ? (
                        <img src={v.imageUrl} alt="preview" className="w-full h-full object-cover"/>
                      ) : (
                        <><ImageIcon size={24} className="text-gray-300 mb-1"/><span className="text-[10px] text-gray-400">Trống</span></>
                      )}
                      {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-green-500/90 text-white text-[10px] text-center py-0.5">Ảnh chính</span>}
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={el => fileInputRefs.current[i] = el} onChange={(e) => handleVariantImageUpload(i, e)}/>
                    <button onClick={() => fileInputRefs.current[i]?.click()} disabled={isUploadingImage} className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-100 w-full font-medium disabled:opacity-50">
                      <UploadCloud size={14} /> Tải ảnh
                    </button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-6 gap-3 w-full">
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs text-gray-500">Mã SKU</label>
                        <button type="button" onClick={() => handleAutoSKU(i)} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">⚡ Tự động tạo</button>
                      </div>
                      <input className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded outline-none text-sm" placeholder="VD: NPK-1KG" value={v.sku || ""} onChange={e => handleVariantChange(i, 'sku', e.target.value)}/>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Quy cách (Khối lượng/Thể tích)</label>
                      <input className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded outline-none text-sm" placeholder="VD: 1kg, 500ml" value={v.weightVolume || ""} onChange={e => handleVariantChange(i, 'weightVolume', e.target.value)}/>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Tồn kho</label>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded outline-none text-sm" 
                        value={v.stockQuantity === 0 ? "" : formatDisplayCurrency(v.stockQuantity)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => handleCurrencyChange(i, 'stockQuantity', e.target.value)}
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-blue-600 font-bold mb-1">Giá nhập (Tiền vốn)</label>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-blue-50 border border-blue-200 px-2 py-1.5 rounded outline-none text-sm focus:ring-1 focus:ring-blue-500" 
                        value={v.importPrice === 0 ? "" : formatDisplayCurrency(v.importPrice)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => handleCurrencyChange(i, 'importPrice', e.target.value)}
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-green-600 font-bold mb-1">Giá bán mới (Thực thu)</label>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-green-50 border border-green-200 px-2 py-1.5 rounded outline-none text-sm focus:ring-1 focus:ring-green-500" 
                        value={v.price === 0 ? "" : formatDisplayCurrency(v.price)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => handleCurrencyChange(i, 'price', e.target.value)}
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 font-bold mb-1">Giá gốc (Bị gạch ngang)</label>
                      <input 
                        type="text" 
                        placeholder="0" 
                        className="w-full bg-gray-100 border border-gray-200 px-2 py-1.5 rounded outline-none text-sm" 
                        value={v.oldPrice === 0 ? "" : formatDisplayCurrency(v.oldPrice)} 
                        onFocus={(e) => e.target.select()} 
                        onChange={e => handleCurrencyChange(i, 'oldPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {formData.variants.length > 1 && (
                    <button onClick={() => removeVariant(i)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm"><X size={16}/></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 3: MÔ TẢ CHI TIẾT */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18} className="text-green-600"/> Mô tả chi tiết (Bài viết)</h3>
            <div className="bg-white pb-12">
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                modules={quillModules} 
                value={formData.fullDesc} 
                onChange={(content) => setFormData({...formData, fullDesc: content})} 
                className="bg-white h-64" 
                placeholder="Nhập nội dung bài viết chi tiết, có thể bấm icon 🖼️ để tải ảnh..."
              />
            </div>
          </div>

          {/* KHỐI 4: KỸ THUẬT */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={18} className="text-purple-600"/> Đặc tính & Kỹ thuật
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Số đăng ký</label>
                <input value={formData.registrationNumber} type="text" placeholder="VD: 1234/QĐ-BVTV" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, registrationNumber: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nhóm độc</label>
                <input value={formData.toxicityClass} type="text" placeholder="VD: An toàn, Độc cao" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, toxicityClass: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Dạng thuốc</label>
                <input value={formData.formulation} type="text" placeholder="VD: WG, SC" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, formulation: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Thời gian cách ly - PHI (Ngày)</label>
                <input value={formData.phiDays === 0 ? "" : formData.phiDays} type="number" placeholder="Nhập số ngày" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, phiDays: e.target.value === "" ? "" : Number(e.target.value)})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Hạn sử dụng</label>
                <input value={formData.shelfLife} type="text" placeholder="VD: 24 Tháng" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg font-medium text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none" onChange={e => setFormData({...formData, shelfLife: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tỷ lệ pha</label>
                <input value={formData.dosageRate} type="text" placeholder="VD: 20ml / Bình 25L" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg font-medium text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, dosageRate: e.target.value})}/>
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 font-medium mb-1">Hoạt chất</label>
                <input value={formData.activeIngredients} type="text" placeholder="VD: Đạm 20%, Kali 10%" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, activeIngredients: e.target.value})}/>
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 font-medium mb-1">Cây trồng mục tiêu</label>
                <input value={formData.targetCrops} type="text" placeholder="Nhập cây trồng mục tiêu..." className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, targetCrops: e.target.value})}/>
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 font-medium mb-1">Mục đích sử dụng</label>
                <textarea value={formData.usagePurpose} rows={2} placeholder="Nhập mục đích sử dụng..." className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, usagePurpose: e.target.value})}/>
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 font-medium mb-1">Hướng dẫn sử dụng chung</label>
                <textarea value={formData.usageInstructions} rows={2} placeholder="Nhập hướng dẫn sử dụng chung..." className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, usageInstructions: e.target.value})}/>
              </div>
              <div className="col-span-3">
                <label className="block text-gray-700 font-medium mb-1">Cảnh báo an toàn</label>
                <textarea value={formData.safetyWarnings} rows={2} placeholder="Nhập cảnh báo an toàn..." className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" onChange={e => setFormData({...formData, safetyWarnings: e.target.value})}/>
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">Hủy bỏ</button>
          <button onClick={handleSubmit} disabled={isUploadingImage} className="px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-bold flex items-center gap-2 disabled:opacity-50"><Save size={18}/> Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL CHI TIẾT SẢN PHẨM 
// ==========================================
function DetailModal({ product, onClose, activeTab, setActiveTab, onEdit, formatCurrency }) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="px-6 border-b border-gray-200 flex space-x-6 overflow-x-auto bg-white">
          <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Info size={16}/>} text="Thông tin chung" />
          <TabButton active={activeTab === "specs"} onClick={() => setActiveTab("specs")} icon={<Settings size={16}/>} text="Kỹ thuật & Đặc tính" />
          <TabButton active={activeTab === "desc"} onClick={() => setActiveTab("desc")} icon={<FileText size={16}/>} text="Mô tả & Bài viết" />
          <TabButton active={activeTab === "variants"} onClick={() => setActiveTab("variants")} icon={<Layers size={16}/>} text="Phân loại & Giá" />
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="aspect-square bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden mb-4 relative">
                  {product.images?.find(img => img.isPrimary) ? (
                     <img src={product.images.find(img => img.isPrimary).imageUrl} alt="img" className="w-full h-full object-cover" />
                  ) : product.images?.length > 0 ? (
                     <img src={product.images[0].imageUrl || product.images[0]} alt="img" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-300" />
                  )}
                </div>
                <ToxicityBadge toxicity={product.toxicityClass} />
              </div>
              <div className="md:col-span-2 space-y-4 text-sm">
                <div><h4 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h4><p className="text-gray-500">Slug: {product.slug}</p></div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div><p className="text-gray-500 mb-1">Danh mục</p><p className="font-semibold text-gray-800">{product.categoryName || "N/A"}</p></div>
                  <div><p className="text-gray-500 mb-1">Thương hiệu</p><p className="font-semibold text-gray-800">{product.brandName || "N/A"}</p></div>
                  <div><p className="text-gray-500 mb-1">Giá bán từ</p><p className="font-semibold text-green-700">{formatCurrency(product.minPrice)}</p></div>
                  <div><p className="text-gray-500 mb-1">Trạng thái</p><p className="font-semibold text-green-600">Đang hiển thị</p></div>
                </div>
                <div><p className="text-gray-500 font-medium mb-1">Mô tả ngắn:</p><p className="text-gray-800">{product.shortDesc}</p></div>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailRow label="Số đăng ký" value={product.registrationNumber} />
              <DetailRow label="Dạng thuốc" value={product.formulation} />
              <DetailRow label="Hạn sử dụng" value={product.shelfLife} />
              <DetailRow label="Thời gian cách ly (PHI Days)" value={product.phiDays ? `${product.phiDays} ngày` : ""} />
              <DetailRow label="Tỷ lệ pha" value={product.dosageRate} fullWidth />
              <DetailRow label="Hoạt chất" value={product.activeIngredients} fullWidth />
              <DetailRow label="Cây trồng mục tiêu" value={product.targetCrops} fullWidth />
            </div>
          )}

          {activeTab === "desc" && (
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><FileText size={16} className="text-blue-600"/> Nội dung bài viết chi tiết</h4>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-800 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.fullDesc || "<p className='text-gray-400'>Chưa có nội dung chi tiết.</p>" }}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Info size={16} className="text-green-600"/> Hướng dẫn sử dụng</h4><div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap h-full">{product.usageInstructions}</div></div>
                <div><h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-600"/> Cảnh báo an toàn</h4><div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-700 whitespace-pre-wrap h-full">{product.safetyWarnings}</div></div>
              </div>
            </div>
          )}

          {activeTab === "variants" && (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200 text-center">Hình ảnh</th>
                    <th className="px-4 py-3 border-b border-gray-200">SKU / Quy cách</th>
                    <th className="px-4 py-3 border-b border-gray-200 text-right">Giá nhập</th>
                    <th className="px-4 py-3 border-b border-gray-200 text-right">Giá bán</th>
                    <th className="px-4 py-3 border-b border-gray-200 text-center">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {product.variants?.map(v => (
                    <tr key={v.id || v.sku} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-gray-100 text-center">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded mx-auto overflow-hidden flex items-center justify-center">
                           {v.imageUrl ? <img src={v.imageUrl} alt={v.sku} className="w-full h-full object-cover"/> : <ImageIcon size={16} className="text-gray-300"/>}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100"><p className="font-medium text-blue-600">{v.sku}</p><p className="text-xs text-gray-500">{v.weightVolume}</p></td>
                      <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-gray-600">{formatCurrency(v.importPrice)}</td>
                      <td className="px-4 py-3 border-b border-gray-100 text-right font-bold text-green-700">
                        {formatCurrency(v.price)}
                        {v.oldPrice > v.price && <p className="text-xs text-gray-400 line-through">{formatCurrency(v.oldPrice)}</p>}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-100 text-center"><span className="px-2 py-1 rounded font-medium text-xs bg-green-100 text-green-700">{v.stockQuantity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium text-sm">Đóng</button>
          <button onClick={onEdit} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium text-sm flex items-center gap-2"><Edit size={16} /> Chỉnh sửa thông tin</button>
        </div>
      </div>
    </div>
  );
}

function ToxicityBadge({ toxicity }) {
  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  if (toxicity) {
    if (toxicity.toLowerCase().includes("an toàn")) badgeStyle = "bg-green-100 text-green-700 border-green-200";
    else if (toxicity.toLowerCase().includes("độc cao")) badgeStyle = "bg-red-100 text-red-700 border-red-200";
    else badgeStyle = "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
  return <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${badgeStyle}`}>{toxicity || "Chưa phân loại"}</span>;
}

function TabButton({ active, onClick, icon, text }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${active ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
      {icon} {text}
    </button>
  );
}

function DetailRow({ label, value, fullWidth = false }) {
  return (
    <div className={`p-3 bg-gray-50 rounded-lg border border-gray-100 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-800">{value || <span className="text-gray-400 italic">Trống</span>}</p>
    </div>
  );
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}