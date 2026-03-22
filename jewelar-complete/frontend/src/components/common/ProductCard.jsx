import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiCamera, FiEye } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { formatPrice, getDiscountPercent } from "../../utils/helpers";

export default function ProductCard({ product, index = 0 }) {
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
    >
      {/* ── Image Container ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Link to={`/products/${product._id}`} className="block h-full w-full">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => { e.target.src = "https://placehold.co/400x500/f8fafc/64748b?text=Jewellery+Image"; }}
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
              PREMIUM
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/products/${product._id}`}
            className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
            title="Quick View"
          >
            <FiEye size={18} />
          </Link>
          <button
            className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-lg"
            title="Add to Wishlist"
          >
            <FiHeart size={18} />
          </button>
        </div>

        {/* Virtual Try-On Prompt */}
        {product.tryOnType && (
          <Link
            to={`/try-on?product=${product._id}`}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md text-amber-600 text-[11px] font-bold py-2 rounded-xl border border-amber-100 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-600 hover:text-white"
          >
            <FiCamera size={14} /> VIRTUAL TRY-ON
          </Link>
        )}
      </div>

      {/* ── Product Info ── */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.15em]">
            {product.category}
          </p>
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1">
              <FaStar className="text-amber-400 text-[10px]" />
              <span className="text-[10px] font-bold text-slate-400">
                {product.rating?.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <Link to={`/products/${product._id}`}>
          <h3 className="font-serif text-slate-900 text-base mb-3 leading-tight hover:text-amber-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <Link 
            to={`/products/${product._id}`}
            className="text-[11px] font-bold text-slate-900 border-b-2 border-amber-400 pb-0.5 hover:text-amber-600 hover:border-amber-600 transition-all"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </motion.div>
  );
}