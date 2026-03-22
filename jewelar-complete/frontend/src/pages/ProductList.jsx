import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiInbox } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/axios";
import ProductCard from "../components/common/ProductCard";
import Spinner from "../components/common/Spinner";

const CATEGORIES = ["earrings", "necklaces", "nose-pins", "rings", "bracelets", "bangles"];
const SORT_OPTIONS = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "top_rated" },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, sort });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (category) p.category = category;
    if (sort !== "newest") p.sort = sort;
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    setSearchParams(p, { replace: true });
    setPage(1);
  }, [search, category, sort, minPrice, maxPrice, setSearchParams]);

  const clearFilters = () => {
    setSearch(""); setCategory(""); setSort("newest");
    setMinPrice(""); setMaxPrice("");
  };

  const hasFilters = search || category || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100 mb-8 pt-12 pb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl text-slate-900 mb-3 tracking-tight font-serif">Our Collection</h1>
          <p className="text-slate-500 font-medium italic tracking-wide">Discover {total} handcrafted pieces of art</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* ── Search & Toolbar ── */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, material or style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div className="flex w-full lg:w-auto gap-3">
            <div className="relative flex-1 lg:w-64 group">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-10 text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 rounded-2xl border font-bold text-sm transition-all shadow-sm ${
                showFilters || hasFilters 
                  ? "bg-amber-500 border-amber-500 text-slate-900 shadow-amber-500/20" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <FiFilter /> Filters {hasFilters && `(${[search, category, minPrice, maxPrice].filter(Boolean).length})`}
            </button>
          </div>
        </div>

        {/* ── Expandable Filter Drawer ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {/* Categories */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCategory(category === c ? "" : c)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            category === c
                              ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-amber-500 hover:text-amber-600"
                          }`}
                        >
                          {c.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Price Range (₹)</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="number" placeholder="Min"
                        value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:bg-white focus:border-amber-500 outline-none transition-all"
                      />
                      <span className="text-slate-300">to</span>
                      <input
                        type="number" placeholder="Max"
                        value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:bg-white focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    <button 
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold py-3 w-full"
                    >
                      <FiX /> Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product Rendering ── */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 py-32 text-center shadow-sm">
            <div className="inline-flex w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
              <FiInbox className="text-slate-300 text-3xl" />
            </div>
            <h3 className="text-2xl text-slate-900 mb-2 font-serif">No pieces found</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium">Try adjusting your filters or searching for something else.</p>
            <button onClick={clearFilters} className="bg-amber-500 text-slate-900 px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-amber-400 transition-all">
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-20">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-600 hover:border-amber-500 disabled:opacity-30 transition-all"
                >
                  Prev
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        p === page
                          ? "bg-slate-900 text-white shadow-lg"
                          : "bg-white border border-slate-100 text-slate-400 hover:border-amber-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-600 hover:border-amber-500 disabled:opacity-30 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}