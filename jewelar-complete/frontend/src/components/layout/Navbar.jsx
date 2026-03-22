import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut,
  FiSettings, FiPackage, FiChevronDown,
} from "react-icons/fi";
import { GiDiamondRing } from "react-icons/gi";

import { logoutUser, selectUser, selectIsAdmin } from "../../store/slices/authSlice";
import { selectCartCount } from "../../store/slices/cartSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const cartCount = useSelector(selectCartCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menus when route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navLinks = [
    { to: "/products", label: "Collections" },
    { to: "/products?category=earrings", label: "Earrings" },
    { to: "/products?category=necklaces", label: "Necklaces" },
    { to: "/try-on", label: "Try On 🪄" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-amber-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <GiDiamondRing className="text-white text-xl" />
          </div>
          <span className="font-serif text-xl text-slate-900 tracking-tight">
            Jewel<span className="text-amber-600">AR</span>
          </span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <ul className="hidden md:flex items-center gap-2">
          {navLinks.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-amber-700 bg-amber-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Action Icons ── */}
        <div className="flex items-center gap-3">
          
          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
          >
            <FiShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-white shadow-sm">
                  <span className="text-xs font-bold">{user.name[0].toUpperCase()}</span>
                </div>
                <FiChevronDown 
                  size={14} 
                  className={`text-slate-500 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`} 
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div className="fixed inset-0 z-[-1]" onClick={() => setUserMenuOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-slate-50">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <Link
                          to="/my-orders"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                        >
                          <FiPackage className="opacity-70" /> My Orders
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                          >
                            <FiSettings className="opacity-70" /> Admin Panel
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1 border-t border-slate-50"
                        >
                          <FiLogOut className="opacity-70" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-all shadow-md"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-inner"
          >
            <div className="px-6 py-6 space-y-2">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center text-base font-medium px-4 py-3 rounded-xl transition-colors ${
                      isActive ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}