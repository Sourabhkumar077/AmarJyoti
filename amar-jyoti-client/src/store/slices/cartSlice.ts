import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/client";
import { toast } from "react-hot-toast";
import { logout } from "./authSlice";

//  TYPES 
interface CartItem {
  product: any;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  _id?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const formatCartItems = (items: any[]): CartItem[] => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => ({
    product: item.product,
    productId: item.product?._id || item.productId || "unknown",
    quantity: item.quantity,
    size: item.size || "",
    color: item.color || "",
    _id: item._id,
  })).filter(i => i.productId !== "unknown");
};

const initialState: CartState = {
  items: [], // Start empty, let fetchCart fill it
  loading: false,
  error: null,
};

//  ASYNC THUNKS  

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/cart");
      // Backend returns { items: [...] } or null
      return response.data ? formatCartItems(response.data.items) : [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (
    params: { product: any; quantity: number; size?: string; color?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/cart/add", {
        productId: params.product._id,
        quantity: params.quantity,
        size: params.size,
        color: params.color,
      });
      return formatCartItems(response.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (
    params: { id: string; size?: string; color?: string },
    { rejectWithValue }
  ) => {
    try {
      let url = `/cart/remove/${params.id}?`;
      if (params.size) url += `size=${params.size}&`;
      if (params.color) url += `color=${params.color}`; // if supported

      const response = await apiClient.delete(url);
      return formatCartItems(response.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put(`/cart/update/${productId}`, { quantity });
      return formatCartItems(response.data.cart.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

//  SLICE 

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },

  extraReducers: (builder) => {
    builder
      //  Fetch 
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
        // Don't wipe items on error, keeps UI stable if network flickers
      })
      
      //  Add 
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        toast.success("Added to cart");
      })
      .addCase(addToCartAsync.rejected, ( action: any) => {
        toast.error(action.payload || "Could not add item");
      })

      //  Remove 
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        toast.success("Removed from cart");
      })

      //  Update 
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      //  Logout 
      .addCase(logout, (state) => {
        state.items = [];
        // Note: App.tsx or authSlice will handle regenerating guest ID
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;