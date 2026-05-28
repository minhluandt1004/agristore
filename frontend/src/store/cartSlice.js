import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = "http://localhost:8080/api/v1/cart";

// =====================================
// 1. ASYNC THUNKS (GỌI API BACKEND)
// =====================================

// Thunk lấy giỏ hàng từ Server
export const fetchCart = createAsyncThunk('cart/fetchCart', async (userId) => {
  const response = await fetch(`${API_URL}/${userId}`);
  if (!response.ok) throw new Error('Lỗi fetch giỏ hàng');
  return response.json();
});

// Thunk Hợp nhất (Merge) giỏ hàng khi Login
export const mergeCartToServer = createAsyncThunk('cart/mergeCart', async (userId, { dispatch }) => {
  const localCart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (localCart.length > 0) {
    await fetch(`${API_URL}/${userId}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        // Lọc lại chỉ gửi variantId và quantity lên server cho nhẹ
        items: localCart.map(item => ({ 
          variantId: item.variantId, 
          quantity: item.quantity 
        })) 
      })
    });
    // Xóa LocalStorage sau khi merge thành công
    localStorage.removeItem('cart');
  }
  
  // Sau khi merge xong, tự động gọi hàm fetchCart để tải giỏ hàng mới nhất về
  dispatch(fetchCart(userId));
});


// =====================================
// 2. HELPERS (HÀM PHỤ TRỢ)
// =====================================

// Hàm tính tổng tiền tự động
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};


// =====================================
// 3. SLICE (REDUCER MAIN)
// =====================================

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    // Nếu chưa đăng nhập thì lấy từ localStorage, ngược lại mảng rỗng
    items: JSON.parse(localStorage.getItem('cart')) || [],
    totalAmount: calculateTotal(JSON.parse(localStorage.getItem('cart')) || []),
    loading: false
  },
  reducers: {
    // Hàm này cập nhật UI ngay lập tức (Dùng chung cho Thêm, Bớt, Xóa)
    updateCartLocal: (state, action) => {
      const { variantId, amount, itemData } = action.payload;
      const existingItem = state.items.find(i => i.variantId === variantId);
      
      if (existingItem) {
        existingItem.quantity += amount;

        if (existingItem.quantity <= 0) {
          state.items = state.items.filter(i => i.variantId !== variantId);
        }
      } else if (amount > 0) {
        state.items.push({ ...itemData, quantity: amount });
      }
      
      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      localStorage.removeItem('cart');
    },

    
  },
  extraReducers: (builder) => {
    // Bắt sự kiện khi API fetchCart trả kết quả về thành công
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.totalAmount = calculateTotal(state.items);
    });
  }
});

// BẮT BUỘC PHẢI EXPORT CÁC HÀM NÀY RA ĐỂ Cart.jsx VÀ Login.jsx GỌI ĐƯỢC
export const { updateCartLocal, clearCart } = cartSlice.actions;
export default cartSlice.reducer;