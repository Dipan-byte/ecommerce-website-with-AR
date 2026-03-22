// src/store/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchProducts = createAsyncThunk("product/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/products?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeatured = createAsyncThunk("product/featured", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/products/featured");
    return res.data.products;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProductById = createAsyncThunk("product/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [], featured: [], current: null,
    loading: false, error: null,
    page: 1, pages: 1, total: 0,
  },
  reducers: { clearCurrent: (s) => { s.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false; s.products = a.payload.products;
        s.page = a.payload.page; s.pages = a.payload.pages; s.total = a.payload.total;
      })
      .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload; })
      .addCase(fetchProductById.pending,   (s) => { s.loading = true; s.current = null; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchProductById.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;
export const selectProducts = (s) => s.product.products;
export const selectFeatured = (s) => s.product.featured;
export const selectCurrent  = (s) => s.product.current;
export const selectProductLoading = (s) => s.product.loading;
