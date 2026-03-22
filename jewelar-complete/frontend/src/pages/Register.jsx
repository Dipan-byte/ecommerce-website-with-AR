import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { GiDiamondRing } from "react-icons/gi";
import { registerUser, clearAuthError, selectAuthLoading, selectAuthError } from "../store/slices/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading  = useSelector(selectAuthLoading);
  const error    = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [showPwd, setShowPwd] = useState(false);

  // Clear errors on load/unload
  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  // Handle Redux Errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    const result = await dispatch(registerUser({ 
      name: formData.name, 
      email: formData.email, 
      password: formData.password 
    }));

    if (registerUser.fulfilled.match(result)) {
      toast.success(`Welcome to JewelAR, ${result.payload.user?.name || 'New Member'}! 💎`);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-amber-500/10 mb-6 border border-slate-100">
            <GiDiamondRing className="text-amber-500 text-3xl" />
          </div>
          <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Join our community of jewelry enthusiasts</p>
        </div>

        {/* ── Form ── */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100 flex flex-col gap-5"
        >
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type="text" name="name" required
                placeholder="Priya Sharma"
                value={formData.name} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type="email" name="email" required
                placeholder="name@example.com"
                value={formData.email} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Create Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type={showPwd ? "text" : "password"} name="password" required
                placeholder="Min. 6 characters"
                value={formData.password} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
              <button
                type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input
                type={showPwd ? "text" : "password"} name="confirm" required
                placeholder="Repeat password"
                value={formData.confirm} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 disabled:opacity-70 mt-4 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Creating Account..." : "Start Your Journey"}
              {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>

          <p className="text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold decoration-2 underline-offset-4 hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}