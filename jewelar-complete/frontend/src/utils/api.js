// src/utils/api.js — Axios instance with base URL + credentials

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send HTTP-only cookie with every request
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — handle global 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Optionally dispatch logout here if needed
    }
    return Promise.reject(err);
  }
);

export default api;
