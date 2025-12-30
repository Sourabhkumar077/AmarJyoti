import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

// --- Types ---
interface CartItem {
  product: any; 
  productId: string; 
  quantity: number;
  size?: string; //  Added size property
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
    const product = item.product;
    return {
      product: product,
      productId: product?._id || "unknown", 
      quantity: item.quantity,
      size: item.size, //  Map size from backend
      _id: item._id
    };
  })
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

//  UPDATED: Add Size to Payload
export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity, size }: { product: any; quantity: number, size?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/cart/add', { 
        productId: product._id, 
        quantity,
        size //  Send size
      });
      toast.success("Added to cart");
      return formatCartItems(response.data.items);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not add to cart");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

//  UPDATED: Remove with Size
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async ({id, size}: {id: string, size?: string}, { rejectWithValue }) => {
    try {
      //  Pass size as query param
      const url = size ? `/cart/remove/${id}?size=${size}` : `/cart/remove/${id}`;
      const response = await apiClient.delete(url);
      toast.success("Removed from cart"); 
      return formatCartItems(response.data.items);
    } catch (error: any) {
      toast.error("Failed to remove item");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

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

//  UPDATED: Merge with Size
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
        quantity: item.quantity,
        size: item.size //  Include size in merge payload
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
    // Guest Actions (Updated for Size)
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      //  Find strict match (ID + Size)
      const existingItem = state.items.find(item => 
        item.productId === newItem.productId && item.size === newItem.size
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      localStorage.setItem('guest_cart', JSON.stringify(state.items));
      toast.success("Added to cart");
    },
    removeFromCartLocal: (state, action: PayloadAction<{id: string, size?: string}>) => {
       //  Filter by ID and Size
       state.items = state.items.filter(item => {
          // Keep item if ID matches BUT Size is different
          if (item.productId === action.payload.id && item.size !== action.payload.size) return true;
          // Keep item if ID is different
          if (item.productId !== action.payload.id) return true;
          // Remove if both match
          return false;
       });
       localStorage.setItem('guest_cart', JSON.stringify(state.items));
       toast.success("Removed from cart");
    },
    updateCartItemLocal: (state, action: PayloadAction<{id: string, quantity: number, size?: string}>) => {
      //  Update specific item size
      const item = state.items.find(item => 
        item.productId === action.payload.id && item.size === action.payload.size
      );
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
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload; 
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // AddToCart
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload; 
        state.loading = false;
      })
      
      // RemoveFromCart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      
      // Update
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      
      // Merge
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        if(action.payload) state.items = action.payload;
      });
  }
});

export const { addToCartLocal, removeFromCartLocal, updateCartItemLocal, clearCart, clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;