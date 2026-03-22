import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiCamera, FiAlertCircle } from "react-icons/fi";
import { GiNecklace, GiEarrings, GiRing, GiSparkles } from "react-icons/gi";
import api from "../utils/axios";
import ProductCard from "../components/common/ProductCard";
import Spinner from "../components/common/Spinner";

const CATEGORIES = [
  { label: "Earrings",  slug: "earrings",  icon: GiEarrings, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
  { label: "Necklaces", slug: "necklaces", icon: GiNecklace, color: "bg-rose-50 text-rose-600", border: "border-rose-100" },
  { label: "Rings",     slug: "rings",     icon: GiRing,     color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
  { label: "Nose Pins", slug: "nose-pins", icon: GiSparkles, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/products/featured")
      .then((r) => {
        setFeatured(r.data.products || []);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError("Unable to load featured products at this time.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen pb-10">
      
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-slate-900 min-h-[85vh] flex items-center">
        {/* Decorative Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block font-medium text-amber-400 text-xs tracking-[0.2em] uppercase mb-6">
              AI-Powered Virtual Try-On
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight mb-6">
              Wear It Before <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                You Buy It
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-lg">
              Try on our entire jewellery collection virtually. See earrings, necklaces, and nose pins on yourself in real time — powered by advanced AI face detection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/try-on" 
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-3.5 px-8 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
              >
                <FiCamera size={20} /> Try On Now
              </Link>
              <Link 
                to="/products" 
                className="flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 hover:bg-slate-800 py-3.5 px-8 rounded-full transition-all duration-300"
              >
                Explore Collection <FiArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full border-[0.5px] border-amber-500/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-6 rounded-full border border-amber-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                  <div className="text-7xl mb-4 animate-[bounce_3s_ease-in-out_infinite]">💍</div>
                  <p className="font-serif text-amber-400/80 text-lg italic">Virtual Try-On</p>
                </div>
              </div>
              {/* Orbiting Elements */}
              {["💎", "✨", "👑", "💫"].map((em, i) => (
                <div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`,
                    left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {em}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-slate-900 mb-4">Shop by Category</h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={`${cat.color} ${cat.border} border rounded-2xl p-8 flex flex-col items-center gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-white`}
              >
                <div className="text-5xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <cat.icon />
                </div>
                <span className="font-serif text-slate-800 text-lg font-medium">{cat.label}</span>
                <span className="text-sm font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  Shop Now <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Featured Pieces</h2>
            <div className="w-24 h-1 bg-amber-400 rounded-full" />
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-amber-500 font-medium transition-colors">
            View All <FiArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center gap-3 justify-center">
            <FiAlertCircle size={20} /> {error}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-100">
            No featured products available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Try-On CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl"
        >
          {/* Banner Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <p className="text-amber-400 text-sm tracking-widest font-semibold uppercase mb-3">
              Experience the Magic
            </p>
            <h3 className="font-serif text-3xl md:text-5xl text-white mb-4">
              Virtual Try-On 🪄
            </h3>
            <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
              Use your device's camera to try on earrings and necklaces in real time. Perfectly mapped to your movements.
            </p>
          </div>
          
          <Link 
            to="/try-on" 
            className="relative z-10 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg py-4 px-10 rounded-full transition-transform hover:scale-105 flex-shrink-0 shadow-xl shadow-amber-500/20"
          >
            <FiCamera size={22} /> Launch Try-On
          </Link>
        </motion.div>
      </section>
      
    </div>
  );
}