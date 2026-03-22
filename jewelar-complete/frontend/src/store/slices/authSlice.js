// src/store/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios";

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/auth/me");
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    loading: false,
    checked: false,
    error:   null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // Register
      .addCase(registerUser.pending,   pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
      })
      .addCase(registerUser.rejected,  rejected)

      // Login
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
      })
      .addCase(loginUser.rejected,  rejected)

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })

      // Fetch me
      .addCase(fetchMe.pending,   (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
        state.checked = true;
      })
      .addCase(fetchMe.rejected,  (state) => {
        state.loading = false;
        state.user    = null;
        state.checked = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectUser         = (s) => s.auth.user;
export const selectIsAdmin      = (s) => s.auth.user?.role === "admin";
export const selectAuthLoading  = (s) => s.auth.loading;
export const selectAuthError    = (s) => s.auth.error;
export const selectChecked      = (s) => s.auth.checked;