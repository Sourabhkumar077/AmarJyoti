import { createSlice, createAsyncThunk,type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

// Types
interface CartItem {
  product: any; // Full product object for display
  productId: string; // ID for logic
  quantity: number;
  _id?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

// Initial State: Check LocalStorage first
const localCart = localStorage.getItem('guest_cart');
const initialState: CartState = {
  items: localCart ? JSON.parse(localCart) : [],
  loading: false,
  error: null,
};

// --- Async Thunks (Backend Operations) ---

// 1. Fetch Cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart', 
  async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/cart');
    return response.data.items.map((item: any) => ({
      product: item.product,
      productId: item.product._id, // use this Safe ID
      quantity: item.quantity,
      _id: item._id
    }));
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

// 2. Add to Cart (Keep same)
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/cart/add', { productId, quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// 3. Remove from Cart (Server) -
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  
  async (productId: string, { rejectWithValue }) => {
    try {
      // Backend expects /cart/remove/:productId
      await apiClient.delete(`/cart/remove/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

// 4. Update Quantity (Server) - 
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',

  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      // Backend expects PUT /cart/update/:productId
      const response = await apiClient.put(`/cart/update/${productId}`, { quantity });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);
// 5. Merge Guest Cart
export const mergeGuestCart = createAsyncThunk(
  'cart/mergeGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      const guestCartStr = localStorage.getItem('guest_cart');
      if (!guestCartStr) return; 

      const guestItems = JSON.parse(guestCartStr);
      if (guestItems.length === 0) return;

      const payload = guestItems.map((item: CartItem) => ({
        productId: item.productId || item.product._id,
        quantity: item.quantity
      }));

      const response = await apiClient.post('/cart/merge', { items: payload });
      localStorage.removeItem('guest_cart');
      
      return response.data.items.map((item: any) => ({
        product: item.product,
        productId: item.product._id,
        quantity: item.quantity,
        _id: item._id
      }));

    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Merge failed');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // 👇 GUEST ACTIONS
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.productId === newItem.productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
    },

    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
    },

    updateCartItemLocal: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const item = state.items.find(item => item.productId === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
    },

   
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('guest_cart');
    },
    
    // Legacy support alias if needed
    clearCartLocal: (state) => {
      state.items = [];
      localStorage.removeItem('guest_cart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items; // Assuming fetchCart returns { items: [...] }
        state.loading = false;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        // Backend returns { message: ..., cart: { items: [...] } }
        state.items = action.payload.cart.items; 
        state.loading = false;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        // Backend returns { message: ..., cart: { items: [...] } }
        state.items = action.payload.cart.items; 
        state.loading = false;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        // Assuming backend returns { message: ..., cart: { items: [...] } }
        // If it returns just the productId, the previous filter logic was correct.
        // Given the consistent issue, we'll assume it returns the updated cart.
        state.items = action.payload.cart.items;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        if(action.payload) state.items = action.payload.items; // Assuming merge returns { items: [...] }
      });
  }
});

// ✅ Export everything needed
export const { 
    addToCartLocal, 
    removeFromCartLocal, 
    updateCartItemLocal, 
    clearCart,           
    clearCartLocal 
} = cartSlice.actions;

export default cartSlice.reducer;