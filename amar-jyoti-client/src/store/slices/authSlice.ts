import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/client";
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
  addresses?: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
  }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedToken = localStorage.getItem("token");
let storedUser: User | null = null;

try {
  const storedUserStr = localStorage.getItem("user");
  if (storedUserStr && storedUserStr !== "undefined") {
    storedUser = JSON.parse(storedUserStr);
  } else {
    localStorage.removeItem("user");
  }
} catch (e) {
  console.error("Failed to load user from storage", e);
  localStorage.removeItem("user");
}

const initialState: AuthState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
};

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
      
      // CRITICAL: Remove the guest ID now that we are logged in.
      // The backend has already merged the carts.
      // We don't want to send this guest ID anymore.
      localStorage.removeItem("guest_cart_id");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // SAFETY: Generate a NEW guest ID for the now-logged-out user.
      // This ensures they start fresh and don't access the old merged cart.
      localStorage.setItem("guest_cart_id", uuidv4());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;