// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              background: "#0a0a0a",
              color: "#faf7f2",
            },
            success: { iconTheme: { primary: "#d4af37", secondary: "#0a0a0a" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
