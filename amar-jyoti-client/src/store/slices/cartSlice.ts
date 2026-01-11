import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import apiClient from "../../api/client";
import { toast } from "react-hot-toast";
import { logout } from "./authSlice";

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
  loadingItems: string[];
  loading: boolean;
  error: string | null;
}

const saveLocal = (items: CartItem[]) => {
  localStorage.setItem("guest_cart", JSON.stringify(items));
};

const getLocalCart = (): CartItem[] => {
  try {
    const localCart = localStorage.getItem("guest_cart");
    return localCart ? JSON.parse(localCart) : [];
  } catch (err) {
    return [];
  }
};

const isSameItem = (item: CartItem, id: string, size?: string, color?: string) => {
  const matchId = item.productId === id || item.product?._id === id;
  const matchSize = (item.size || "") === (size || ""); 
  const matchColor = (item.color || "") === (color || "");
  return matchId && matchSize && matchColor;
};

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
  items: getLocalCart(),
  loadingItems: [],
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
      if (params.size) url += `size=${params.size}&`;
      if (params.color) url += `color=${params.color}`;

      await apiClient.delete(url);
      return params; 
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
      const guestItems = getLocalCart();
      if (guestItems.length === 0) return [];
      
      const payload = guestItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const response = await apiClient.post("/cart/merge", { items: payload });
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
      const existingItem = state.items.find((item) =>
        isSameItem(item, newItem.productId, newItem.size, newItem.color)
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      saveLocal(state.items);
      toast.success("Added to cart");
    },

    removeFromCartLocal: (
      state,
      action: PayloadAction<{ id: string; size?: string; color?: string }>
    ) => {
      const { id, size, color } = action.payload;
      const initialLen = state.items.length;
      state.items = state.items.filter((item) => !isSameItem(item, id, size, color));
      
      if(state.items.length !== initialLen) {
          saveLocal(state.items);
          toast.success("Removed from cart");
      }
    },

    updateCartItemLocal: (
      state,
      action: PayloadAction<{ id: string; quantity: number; size?: string }>
    ) => {
      const item = state.items.find((item) =>
        isSameItem(item, action.payload.id, action.payload.size)
      );
      if (item) {
        item.quantity = action.payload.quantity;
        saveLocal(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.loadingItems = [];
      localStorage.removeItem("guest_cart");
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.loadingItems = [];
      localStorage.removeItem("guest_cart");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        toast.success("Added to cart");
      })

      // ---  Manages the Spinner in CartItem.tsx ---
      .addCase(removeFromCartAsync.pending, (state, action) => {
        state.loadingItems.push(action.meta.arg.id);
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        const { id, size, color } = action.payload;
        state.items = state.items.filter((item) => !isSameItem(item, id, size, color));
        state.loadingItems = state.loadingItems.filter(itemIds => itemIds !== id);
        toast.success("Removed from cart");
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.loadingItems = state.loadingItems.filter(itemIds => itemIds !== id);
        toast.error("Could not sync with server");
      })


      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      })

      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        if(action.payload) state.items = action.payload;
        localStorage.removeItem("guest_cart");
        toast.success("Cart merged");
      })

      .addCase(logout, (state) => {
        state.items = [];
        state.loadingItems = [];
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