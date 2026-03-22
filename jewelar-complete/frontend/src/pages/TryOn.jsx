import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiShoppingBag, FiInfo, FiX, FiCheck, FiVideoOff } from "react-icons/fi";
import { GiCrystalCluster } from "react-icons/gi";
import api from "../utils/axios";
import TryOnCanvas from "../components/ar/TryOnCanvas";
import Spinner from "../components/common/Spinner";
import { formatPrice } from "../utils/helpers";

const TYPE_FILTERS = [
  { label: "All Pieces", value: "" },
  { label: "Earrings", value: "earring" },
  { label: "Nose Pins", value: "nose" },
  { label: "Necklaces", value: "necklace" },
];

export default function TryOn() {
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [cameraErr, setCameraErr] = useState(null);

  useEffect(() => {
    const fetchTryOnProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?limit=100`);
        // Filter for products that specifically have AR assets
        const tryable = data.products.filter((p) => p.tryOnType && p.tryOnAsset);
        setProducts(tryable);

        if (id) {
          const found = tryable.find((p) => p._id === id);
          setSelected(found || tryable[0] || null);
        } else {
          setSelected(tryable[0] || null);
        }
      } catch (err) {
        console.error("AR Product Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTryOnProducts();
  }, [id]);

  const filtered = typeFilter
    ? products.filter((p) => p.tryOnType === typeFilter)
    : products;

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Top Navigation / Header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-lg shadow-slate-900/20">
              <FiCamera size={24} />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-slate-900 tracking-tight leading-none">Virtual Mirror</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time AR Experience</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowTips(!showTips)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
              showTips ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            <FiInfo /> {showTips ? "Hide Tips" : "How it works"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── LEFT: Studio View (Camera) ── */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                   <div className="flex-1">
                      <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-2 italic">
                        <GiCrystalCluster /> Optimal Experience
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-slate-400 font-medium">
                        <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Center your face in the frame</li>
                        <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Ensure bright, natural lighting</li>
                        <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Remove glasses for nose pins</li>
                        <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Pull hair back for earrings</li>
                      </ul>
                   </div>
                   <button onClick={() => setShowTips(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white">
                      <FiX />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera Viewport */}
          <div className="relative aspect-video lg:aspect-[16/10] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
            {cameraErr ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                  <FiVideoOff size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Camera Restricted</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">{cameraErr}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-100 transition-all"
                >
                  Enable Permissions
                </button>
              </div>
            ) : (
              <TryOnCanvas 
                product={selected} 
                onCameraError={(err) => setCameraErr(err)} 
              />
            )}

            {/* Live Indicator Overlay */}
            {!cameraErr && (
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Studio</span>
                </div>
              </div>
            )}
          </div>

          {/* Selection Sticky CTA */}
          {selected && (
            <motion.div 
              key={selected._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                   <img src={selected.images?.[0]} className="w-full h-full object-cover" alt="Selected" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-slate-900">{selected.name}</h3>
                  <p className="text-amber-600 font-bold">{formatPrice(selected.discountPrice || selected.price)}</p>
                </div>
              </div>
              <Link to={`/products/${selected._id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                <FiShoppingBag /> View Piece
              </Link>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Product Selection Sidebar ── */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden sticky top-8 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-50">
               <h2 className="font-serif text-xl text-slate-900 mb-6">Select a Design</h2>
               
               {/* Categories */}
               <div className="flex flex-wrap gap-2">
                 {TYPE_FILTERS.map((f) => (
                   <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      typeFilter === f.value 
                        ? "bg-amber-500 text-slate-900" 
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                   >
                     {f.label}
                   </button>
                 ))}
               </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                   <GiCrystalCluster className="text-slate-200 text-5xl mx-auto mb-4" />
                   <p className="text-slate-400 text-sm italic font-medium">No results found in this category.</p>
                </div>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setSelected(p)}
                    className={`w-full group p-4 rounded-3xl border-2 transition-all flex items-center gap-4 ${
                      selected?._id === p._id 
                        ? "border-amber-500 bg-amber-50/30 shadow-md" 
                        : "border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0 shadow-sm">
                       <img src={p.images?.[0]} className="w-full h-full object-cover" alt="Selection" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{p.tryOnType}</p>
                       <p className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">{p.name}</p>
                       <p className="text-xs text-slate-500 mt-1 font-medium">{formatPrice(p.discountPrice || p.price)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Privacy Note */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-100">
               <div className="flex gap-3 text-slate-400">
                  <FiInfo size={16} className="mt-0.5" />
                  <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tighter">
                    Mirror privacy: Video feed remains local to your browser and is never stored.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}