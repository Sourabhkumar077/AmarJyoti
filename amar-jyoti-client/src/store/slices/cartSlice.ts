import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  count: number;
}

const initialState: CartState = {
  items: [],
  count: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Sync with backend response
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.count = action.payload.reduce((acc, item) => acc + item.quantity, 0);
    },
    addToCartOptimistic: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.count += action.payload.quantity;
    },
    clearCart: (state) => {
      state.items = [];
      state.count = 0;
    }
  },
});

export const { setCart, addToCartOptimistic, clearCart } = cartSlice.actions;
export default cartSlice.reducer;