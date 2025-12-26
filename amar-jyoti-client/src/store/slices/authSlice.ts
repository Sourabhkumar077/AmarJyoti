import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../api/client";

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
  //  Check if the string is explicitly "undefined"
  if (storedUserStr && storedUserStr !== "undefined") {
    storedUser = JSON.parse(storedUserStr);
  } else {
    // If it is "undefined", clear it immediately to clean the browser
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
      const response = await apiClient.get("/users/account");
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
      //  Only save if user data actually exists
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
        // Update local storage with fresh data
        // Only save if payload is valid
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
