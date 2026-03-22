// src/store/slices/cartSlice.js

import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem("jewelar_cart")) || [];
  } catch { return []; }
};

const saveCart = (items) => {
  localStorage.setItem("jewelar_cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, product.stock);
      } else {
        state.items.push({ product, qty });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.product._id !== action.payload);
      saveCart(state.items);
    },
    updateQty: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        item.qty = qty;
        if (item.qty <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((a, i) => a + i.qty, 0);
export const selectCartTotal = (s) =>
  s.cart.items.reduce((a, i) => {
    const price = i.product.discountPrice > 0 ? i.product.discountPrice : i.product.price;
    return a + price * i.qty;
  }, 0);