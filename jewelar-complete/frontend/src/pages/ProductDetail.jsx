import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiCamera, FiShoppingBag, FiArrowLeft, FiPlus, FiMinus, FiStar, FiShield, FiTruck } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import api from "../utils/axios";
import { addToCart } from "../store/slices/cartSlice";
import { selectUser } from "../store/slices/authSlice";
import { formatPrice, getDiscountPercent, formatDate } from "../utils/helpers";
import Spinner from "../components/common/Spinner";

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/products/${id}`)
       .then((r) => setProduct(r.data.product))
       .catch(() => navigate("/products"))
       .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Spinner fullscreen />;
  if (!product) return null;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = getDiscountPercent(product.price, product.discountPrice);

  const handleAddToCart = () => {
    if (!user) return navigate("/login");
    dispatch(addToCart({ product, qty }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success("Thank you for your review!");
      setReview({ rating: 5, comment: "" });
      const r = await api.get(`/products/${id}`);
      setProduct(r.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ── Header / Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors text-sm font-bold uppercase tracking-widest">
          <FiArrowLeft /> Back to Collection
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
        
        {/* ── Left: Image Gallery ── */}
        <div className="space-y-6">
          <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 relative group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                src={product.images?.[activeImage]}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {discount > 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                {discount}% OFF
              </span>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImage === i ? "border-amber-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ── */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.3em]">{product.category}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 leading-[1.1] mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
              <FaStar className="text-amber-500 text-xs" />
              <span className="text-sm font-bold text-amber-700">{product.rating?.toFixed(1)}</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">{product.numReviews} Reviews</span>
          </div>

          <div className="flex items-baseline gap-4 mb-8 border-b border-slate-100 pb-8">
            <span className="text-4xl font-bold text-slate-900">{formatPrice(price)}</span>
            {discount > 0 && (
              <span className="text-xl text-slate-300 line-through font-medium">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-slate-500 text-lg leading-relaxed mb-10">
            {product.description}
          </p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { label: "Material", value: product.material, icon: <FiShield className="text-amber-500" /> },
              { label: "Delivery", value: "3-5 Business Days", icon: <FiTruck className="text-amber-500" /> }
            ].map((spec, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="mt-1">{spec.icon}</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{spec.label}</p>
                  <p className="text-sm font-bold text-slate-900">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          {product.stock > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all text-slate-600"><FiMinus /></button>
                  <span className="w-12 text-center font-bold text-slate-900">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-all text-slate-600"><FiPlus /></button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleAddToCart} className="flex-1 bg-slate-900 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                  <FiShoppingBag size={20} /> ADD TO BAG
                </button>
                {product.tryOnType && (
                  <Link to={`/try-on?product=${product._id}`} className="bg-amber-500 text-slate-900 font-bold px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 active:scale-95">
                    <FiCamera size={20} /> TRY ON
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-center font-bold">
              Currently Unavailable
            </div>
          )}
        </div>
      </main>

      {/* ── Reviews Section ── */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="flex items-baseline justify-between mb-12 border-b border-slate-100 pb-6">
          <h2 className="font-serif text-3xl text-slate-900">Guest Reviews</h2>
          <span className="text-slate-400 font-medium">{product.numReviews} Verified Experiences</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-8">
            {product.reviews?.length === 0 ? (
              <p className="text-slate-400 italic">No reviews yet for this masterpiece.</p>
            ) : (
              product.reviews.map((r) => (
                <div key={r._id} className="border-b border-slate-50 pb-8 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < r.rating ? "text-amber-400 text-xs" : "text-slate-200 text-xs"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Form */}
          {user && (
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 h-fit sticky top-32">
              <h3 className="font-serif text-xl text-slate-900 mb-6">Leave a Review</h3>
              <form onSubmit={handleReview} className="space-y-6">
                <div className="flex gap-2 bg-white p-3 rounded-2xl justify-center border border-slate-200">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReview({ ...review, rating: s })} className="transition-transform active:scale-90">
                      <FaStar className={`text-2xl ${s <= review.rating ? "text-amber-500" : "text-slate-100"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder="Tell us about the craftsmanship..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none h-32 resize-none transition-all"
                  required
                />
                <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
                  {submitting ? "Publishing..." : "SUBMIT REVIEW"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}