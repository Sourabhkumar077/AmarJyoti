import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiClient from "../../api/client";
import { toast } from "react-hot-toast";

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

  return items
    .map((item): CartItem | null => {
      const product = item.product;
      if (!product) return null;
      
      return {
        product: product,
        productId: product._id || item.productId || "unknown",
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        _id: item._id,
      };
    })
    .filter((item): item is CartItem => item !== null && item.productId !== "unknown");
};

const localCart = localStorage.getItem("guest_cart");
const initialState: CartState = {
  items: localCart ? JSON.parse(localCart) : [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/cart");
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
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
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
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
      if(params.size) url += `size=${params.size}&`;
      if(params.color) url += `color=${params.color}`;
      
      const response = await apiClient.delete(url);
      return formatCartItems(response.data.items);
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
      const response = await apiClient.put(`/cart/update/${productId}`, {
        quantity,
      });
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { rejectWithValue }) => {
    try {
      const guestCartStr = localStorage.getItem("guest_cart");
      if (!guestCartStr) return [];

      const guestItems = JSON.parse(guestCartStr);
      if (guestItems.length === 0) return [];

      const payload = guestItems.map((item: CartItem) => ({
        productId: item.productId || item.product?._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const response = await apiClient.post("/cart/merge", { items: payload });
      localStorage.removeItem("guest_cart");
      return formatCartItems(response.data.items);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => 
        item.productId === newItem.productId && 
        item.size === newItem.size && 
        item.color === newItem.color
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      localStorage.setItem("guest_cart", JSON.stringify(state.items));
      toast.success("Added to cart");
    },
    removeFromCartLocal: (
      state,
      action: PayloadAction<{ id: string; size?: string, color?: string }>
    ) => {
      state.items = state.items.filter((item) => {
        const matchId = item.productId === action.payload.id;
        const matchSize = item.size === action.payload.size;
        const matchColor = item.color === action.payload.color;
        return !(matchId && matchSize && matchColor);
      });
      localStorage.setItem("guest_cart", JSON.stringify(state.items));
      toast.success("Removed from cart");
    },
    updateCartItemLocal: (
      state,
      action: PayloadAction<{ id: string; quantity: number; size?: string }>
    ) => {
      const item = state.items.find(
        (item) =>
          item.productId === action.payload.id &&
          item.size === action.payload.size
      );
      if (item) item.quantity = action.payload.quantity;
      localStorage.setItem("guest_cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("guest_cart");
    },
    clearCartLocal: (state) => {
      state.items = [];
      localStorage.removeItem("guest_cart");
    },
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

      .addCase(addToCartAsync.pending, (state, action) => {
        const { product, quantity, size, color } = action.meta.arg;
        const newItem = {
            product: product,
            productId: product._id,
            quantity: quantity,
            size: size,
            color: color,
            _id: "temp-" + Date.now()
        };
        
        const existingItem = state.items.find(item => 
             item.productId === newItem.productId && 
             item.size === newItem.size && 
             item.color === newItem.color
        );

        if (existingItem) {
             existingItem.quantity += newItem.quantity;
        } else {
             state.items.push(newItem);
        }
        toast.success("Added to cart");
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addToCartAsync.rejected, () => {
        toast.error("Failed to add to cart");
      })

      .addCase(removeFromCartAsync.pending, (state, action) => {
        const { id, size, color } = action.meta.arg;
        state.items = state.items.filter((item) => {
            const matchId = item.productId === id;
            const matchSize = item.size === size;
            const matchColor = item.color === color;
            return !(matchId && matchSize && matchColor);
        });
        toast.success("Removed from cart");
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
            state.items = action.payload;
        }
      })
      .addCase(removeFromCartAsync.rejected, () => {
         toast.error("Failed to remove item");
      })

      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        if (action.payload) state.items = action.payload;
      });
  },
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  updateCartItemLocal,
  clearCart,
  clearCartLocal,
} = cartSlice.actions;
export default cartSlice.reducer;