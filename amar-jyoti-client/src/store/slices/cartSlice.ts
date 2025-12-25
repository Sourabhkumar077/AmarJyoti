import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

// --- Types ---
interface CartItem {
  product: any; 
  productId: string; 
  quantity: number;
  _id?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

// --- Helper: Standardize Data ---
const formatCartItems = (items: any[]): CartItem[] => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map((item) => {
    // If product is missing (deleted from DB), marked as null
    const product = item.product;
    return {
      product: product,
      productId: product?._id || "unknown", 
      quantity: item.quantity,
      _id: item._id
    };
  })
  // 🛑 FILTER: Remove "Ghost" items (null products)
  .filter(item => item.product && item.productId !== "unknown");
};

// --- Initial State ---
const localCart = localStorage.getItem('guest_cart');
const initialState: CartState = {
  items: localCart ? JSON.parse(localCart) : [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

// 1. Fetch Cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/cart');
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// 2. Add to Cart (OPTIMISTIC)
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  // We accept the WHOLE product object, not just ID
  async ({ product, quantity }: { product: any; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/cart/add', { 
        productId: product._id, 
        quantity 
      });
      
      toast.success("Added to cart");
      return formatCartItems(response.data.items);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not add to cart");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 3. Remove Item
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/cart/remove/${productId}`);
      toast.success("Removed from cart"); 
      return formatCartItems(response.data.items);
    } catch (error: any) {
      toast.error("Failed to remove item");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 4. Update Quantity
export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/cart/update/${productId}`, { quantity });
      return formatCartItems(response.data.items);
    } catch (error: any) {
      toast.error("Failed to update cart");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// 5. Merge Guest Cart
export const mergeGuestCart = createAsyncThunk(
  'cart/mergeGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      const guestCartStr = localStorage.getItem('guest_cart');
      if (!guestCartStr) return []; 

      const guestItems = JSON.parse(guestCartStr);
      if (guestItems.length === 0) return [];

      const payload = guestItems.map((item: CartItem) => ({
        productId: item.productId || item.product?._id,
        quantity: item.quantity
      }));

      const response = await apiClient.post('/cart/merge', { items: payload });
      localStorage.removeItem('guest_cart');
      
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Guest Actions
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.productId === newItem.productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
      toast.success("Added to cart");
    },
    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
      toast.success("Removed from cart");
    },
    updateCartItemLocal: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const item = state.items.find(item => item.productId === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('guest_cart');
    },
    clearCartLocal: (state) => {
      state.items = [];
      localStorage.removeItem('guest_cart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload; 
        state.loading = false;
      })
      
     
      .addCase(addToCartAsync.pending, (state, action) => {
        const { product, quantity } = action.meta.arg;
        const existingItem = state.items.find(item => item.productId === product._id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          // Add temporary item immediately
          state.items.push({
            product: product,
            productId: product._id,
            quantity: quantity,
            _id: "temp-id" 
          });
        }
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload; // Sync with real server data
        state.loading = false;
      })
      .addCase(addToCartAsync.rejected, (state,) => {
        state.loading = false;
        // In a real app, you would revert the change here
      })

  
      .addCase(removeFromCartAsync.pending, (state, action) => {
        const productId = action.meta.arg;
        state.items = state.items.filter(item => item.productId !== productId);
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        if(action.payload) state.items = action.payload;
      });
  }
});

export const { addToCartLocal, removeFromCartLocal, updateCartItemLocal, clearCart, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;