import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiSearch, FiLayers, FiCamera } from "react-icons/fi";
import api from "../../utils/axios";
import Spinner from "../../components/common/Spinner";
import { formatPrice, categoryLabel } from "../../utils/helpers";

const CATEGORIES = ["earrings", "necklaces", "nose-pins", "rings", "bracelets", "bangles", "other"];
const TRYON_TYPES = [
  { value: "", label: "None" },
  { value: "earring", label: "Earring Overlay" },
  { value: "nose", label: "Nose Pin Overlay" },
  { value: "necklace", label: "Necklace Overlay" }
];

const emptyForm = {
  name: "", description: "", price: "", discountPrice: "",
  category: "earrings", material: "", weight: "", stock: "",
  tryOnType: "", tryOnAsset: "", featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await api.get("/products?limit=100");
      setProducts(r.data.products);
    } catch (err) {
      toast.error("Failed to fetch inventory");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { 
    setEditing(null); 
    setForm(emptyForm); 
    setFiles([]); 
    setShowModal(true); 
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description,
      price: p.price, discountPrice: p.discountPrice || "",
      category: p.category, material: p.material || "",
      weight: p.weight || "", stock: p.stock,
      tryOnType: p.tryOnType || "", tryOnAsset: p.tryOnAsset || "",
      featured: p.featured || false,
    });
    setFiles([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("images", f));

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      
      if (editing) {
        await api.put(`/products/${editing._id}`, fd, config);
        toast.success("Masterpiece updated");
      } else {
        await api.post("/products", fd, config);
        toast.success("New product added to collection");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Storage error");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Removed from inventory");
      setProducts(products.filter(p => p._id !== id));
    } catch (err) { toast.error(err.message); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const upd = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 pt-12 pb-10 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl text-slate-900 tracking-tight">Inventory Manager</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your digital vault of {products.length} pieces</p>
          </div>
          <button onClick={openCreate} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            <FiPlus /> New Product
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Search Bar */}
        <div className="relative max-w-md mb-8 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text" placeholder="Search by name or category..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
          />
        </div>

        {loading ? <Spinner /> : (
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {["Design", "Category", "Valuation", "Inventory", "AR Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => (
                    <tr key={p._id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={p.images?.[0]}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
                            alt=""
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            {p.featured && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter border border-amber-100">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider">{p.category}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{formatPrice(p.discountPrice || p.price)}</p>
                        {p.discountPrice > 0 && <p className="text-[10px] text-slate-400 line-through font-medium">{formatPrice(p.price)}</p>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                           <span className="text-xs font-bold text-slate-600">{p.stock} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {p.tryOnType ? (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            <FiCamera /> {p.tryOnType}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-bold tracking-widest uppercase">Disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                   <h2 className="font-serif text-2xl text-slate-900">{editing ? "Edit Piece" : "Add New Design"}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Catalog Entry Form</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Info */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Title</label>
                    <input required type="text" value={form.name} onChange={upd("name")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea required rows={4} value={form.description} onChange={upd("description")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all resize-none" />
                  </div>

                  {/* Numbers */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (INR)</label>
                    <input required type="number" value={form.price} onChange={upd("price")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:border-amber-500 outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Inventory Stock</label>
                    <input required type="number" value={form.stock} onChange={upd("stock")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm focus:bg-white focus:border-amber-500 outline-none" />
                  </div>

                  {/* AR Settings */}
                  <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 space-y-4 md:col-span-2">
                    <h3 className="text-indigo-600 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                      <FiCamera /> AR Try-On Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">AR Overlay Type</label>
                        <select value={form.tryOnType} onChange={upd("tryOnType")} className="w-full bg-white border border-indigo-100 rounded-2xl py-4 px-5 text-sm outline-none">
                          {TRYON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset URL (Transparent PNG)</label>
                        <input type="url" value={form.tryOnAsset} onChange={upd("tryOnAsset")} placeholder="https://..." className="w-full bg-white border border-indigo-100 rounded-2xl py-4 px-5 text-sm outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Images</label>
                    <div 
                      onClick={() => fileRef.current.click()}
                      className="mt-2 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all group"
                    >
                      <FiUpload className="mx-auto text-slate-300 group-hover:text-amber-500 mb-3" size={30} />
                      <p className="text-sm font-bold text-slate-600">Drag & drop or click to upload</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Maximum 5 images • JPEG, PNG or WebP</p>
                      <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
                    </div>
                    {files.length > 0 && (
                       <div className="mt-4 flex flex-wrap gap-2">
                         {files.map((f, i) => (
                           <div key={i} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100">
                             ✓ {f.name}
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-12 pb-4">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors">
                     Discard Changes
                   </button>
                   <button type="submit" disabled={submitting} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 disabled:opacity-50">
                     {submitting ? "Processing..." : editing ? "Save Piece" : "Confirm Addition"}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}