import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { GiDiamondRing } from "react-icons/gi";
import { 
  loginUser, 
  clearAuthError, 
  selectAuthLoading, 
  selectAuthError 
} from "../store/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Clear errors when the component unmounts
  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name || 'JewelAR user'}! 💎`);
      navigate("/");
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setEmail("admin@jewelar.com");
      setPassword("admin123");
    } else {
      setEmail("user@jewelar.com");
      setPassword("user123");
    }
    toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} details filled!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* ── Logo & Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-amber-500/10 mb-6 border border-slate-100">
            <GiDiamondRing className="text-amber-500 text-3xl" />
          </div>
          <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Sign in to your premium jewelry experience</p>
        </div>

        {/* ── Demo Access Panel ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quick Demo Access</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fillDemo("user")} 
              className="flex-1 text-[11px] font-bold py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all"
            >
              USER PREVIEW
            </button>
            <button 
              onClick={() => fillDemo("admin")} 
              className="flex-1 text-[11px] font-bold py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              ADMIN PANEL
            </button>
          </div>
        </div>

        {/* ── Login Form ── */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 flex flex-col gap-6"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type="email" required
                placeholder="name@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              Password
              <Link to="/forgot-password" size={12} className="lowercase tracking-normal font-medium text-amber-600 hover:text-amber-700">Forgot?</Link>
            </label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type={showPwd ? "text" : "password"} required
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
              <button
                type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden mt-2"
          >
            <span className="relative z-10">{loading ? "Verifying..." : "Sign Into JewelAR"}</span>
            {!loading && <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />}
          </button>

          {/* Footer Link */}
          <p className="text-center text-sm text-slate-500 mt-2 font-medium">
            New to JewelAR?{" "}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold decoration-2 underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}