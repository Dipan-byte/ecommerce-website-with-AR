// src/pages/Cart.jsx

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiArrowRight, FiShoppingBag, FiMinus, FiPlus } from "react-icons/fi";
import {
  selectCartItems, selectCartTotal,
  removeFromCart, updateQty,
} from "../store/slices/cartSlice";
import { formatPrice } from "../utils/helpers";

export default function Cart() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartTotal);
  const shipping  = subtotal > 5000 ? 0 : 199;
  const tax       = Math.round(subtotal * 0.03);
  const total     = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="page-container py-24 flex flex-col items-center gap-6 text-center">
        <div className="text-8xl animate-float">🛍️</div>
        <h2 className="font-display text-3xl text-obsidian-800">Your cart is empty</h2>
        <p className="font-body text-obsidian-500 text-lg max-w-sm">
          Looks like you haven't added any jewellery yet. Browse our collection to find something beautiful.
        </p>
        <Link to="/products" className="btn-gold gap-2">
          <FiShoppingBag size={16} /> Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10 animate-fade-in">
      <h1 className="section-heading mb-2">Shopping Cart</h1>
      <p className="font-body text-obsidian-500 text-lg mb-10">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <AnimatePresence>
            {items.map(({ product, qty }) => {
              const price = product.discountPrice > 0 ? product.discountPrice : product.price;
              const image = product.images?.[0] || "https://placehold.co/200x200/f5f0e8/b8960c?text=💍";
              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-5 shadow-card flex gap-5"
                >
                  <Link to={`/products/${product._id}`} className="flex-shrink-0">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover bg-obsidian-50"
                      onError={(e) => { e.target.src = "https://placehold.co/200x200/f5f0e8/b8960c?text=💍"; }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-sans text-[11px] text-gold-600 uppercase tracking-widest">{product.category}</p>
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-display text-base text-obsidian-900 mt-0.5 hover:text-gold-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        {product.material && (
                          <p className="font-sans text-xs text-obsidian-400 mt-1">{product.material}</p>
                        )}
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(product._id))}
                        className="text-obsidian-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Qty controls */}
                      <div className="flex items-center border border-obsidian-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => dispatch(updateQty({ productId: product._id, qty: qty - 1 }))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-obsidian-50 transition-colors text-obsidian-600"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center font-sans text-sm font-medium">{qty}</span>
                        <button
                          onClick={() => dispatch(updateQty({ productId: product._id, qty: qty + 1 }))}
                          disabled={qty >= product.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-obsidian-50 transition-colors text-obsidian-600 disabled:opacity-40"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <span className="font-sans font-semibold text-obsidian-900">
                        {formatPrice(price * qty)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="font-display text-xl text-obsidian-900 mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm font-sans mb-6">
              <div className="flex justify-between text-obsidian-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-obsidian-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 -mt-1">🎉 You qualify for free shipping!</p>
              )}
              <div className="flex justify-between text-obsidian-600">
                <span>GST (3%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-obsidian-100 pt-3 flex justify-between font-semibold text-obsidian-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="bg-amber-50 text-amber-700 text-xs font-sans rounded-xl px-3 py-2.5 mb-5">
                Add {formatPrice(5000 - subtotal)} more for free shipping!
              </div>
            )}

            <button
              onClick={() => navigate("/checkout")}
              className="btn-gold w-full py-3.5 gap-2 text-base"
            >
              Proceed to Checkout <FiArrowRight size={16} />
            </button>

            <Link to="/products" className="block text-center font-sans text-sm text-obsidian-500 hover:text-gold-600 mt-4 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
