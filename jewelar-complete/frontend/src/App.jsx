// src/App.jsx — Root router

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, selectUser, selectChecked, selectIsAdmin } from "./store/slices/authSlice";

import Navbar        from "./components/layout/Navbar";
import Footer        from "./components/layout/Footer";
import Spinner       from "./components/common/Spinner";

import Home          from "./pages/Home";
import ProductList   from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart          from "./pages/Cart";
import Checkout      from "./pages/Checkout";
import OrderSuccess  from "./pages/OrderSuccess";
import MyOrders      from "./pages/MyOrders";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import TryOn         from "./pages/TryOn";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts  from "./pages/admin/Products";
import AdminOrders    from "./pages/admin/Orders";

// ─── Route Guards ─────────────────────────────────────────────────────────────

const PrivateRoute = ({ children }) => {
  const user    = useSelector(selectUser);
  const checked = useSelector(selectChecked);
  if (!checked) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user    = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const checked = useSelector(selectChecked);
  if (!checked) return <Spinner />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const user    = useSelector(selectUser);
  const checked = useSelector(selectChecked);
  if (!checked) return <Spinner />;
  return !user ? children : <Navigate to="/" replace />;
};

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const dispatch = useDispatch();
  const checked  = useSelector(selectChecked);

  // On app load, verify if user is already logged in (via cookie)
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!checked) return <Spinner fullscreen />;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"                 element={<Home />} />
          <Route path="/products"         element={<ProductList />} />
          <Route path="/products/:id"     element={<ProductDetail />} />
          <Route path="/try-on/:id?"      element={<TryOn />} />

          {/* Auth */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Private */}
          <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/order-success/:id" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/my-orders"         element={<PrivateRoute><MyOrders /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders"   element={<AdminRoute><AdminOrders /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
