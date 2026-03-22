// src/pages/Checkout.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiLock, FiCreditCard, FiTruck, FiCheckCircle } from "react-icons/fi";
import api from "../utils/axios";
import { selectCartItems, selectCartTotal, clearCart } from "../store/slices/cartSlice";
import { formatPrice } from "../utils/helpers";

const STEPS = ["Shipping", "Payment", "Review"];

const PAYMENT_METHODS = [
  { id: "cod",       label: "Cash on Delivery", icon: "🏠" },
  { id: "mock_upi",  label: "UPI (Mock)",        icon: "📱" },
  { id: "mock_card", label: "Card (Mock)",        icon: "💳" },
];

export default function Checkout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const items     = useSelector(selectCartItems);
  const subtotal  = useSelector(selectCartTotal);

  const shipping  = subtotal > 5000 ? 0 : 199;
  const tax       = Math.round(subtotal * 0.03);
  const total     = subtotal + shipping + tax;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "", phone: "", address: "", city: "", state: "", pincode: "", country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const updateAddress = (field) => (e) => setAddress((p) => ({ ...p, [field]: e.target.value }));

  const validateAddress = () => {
    const required = ["fullName", "phone", "address", "city", "state", "pincode"];
    const missing  = required.find((f) => !address[f].trim());
    if (missing) { toast.error(`Please fill in ${missing}`); return false; }
    if (!/^\d{10}$/.test(address.phone)) { toast.error("Enter a valid 10-digit phone number"); return false; }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error("Enter a valid 6-digit pincode"); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = items.map(({ product, qty }) => ({
        product: product._id,
        qty,
      }));
      const res = await api.post("/orders", {
        items:           orderItems,
        shippingAddress: address,
        paymentMethod,
      });
      dispatch(clearCart());
      toast.success("Order placed successfully! 🎉");
      navigate(`/order-success/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-10 max-w-5xl animate-fade-in">
      <h1 className="section-heading mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? "text-obsidian-900" : "text-obsidian-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans font-semibold
                ${i < step  ? "bg-gold-500 text-white"
                : i === step ? "bg-obsidian-900 text-white"
                : "bg-obsidian-100 text-obsidian-400"}`}>
                {i < step ? <FiCheckCircle size={16} /> : i + 1}
              </div>
              <span className="font-sans text-sm hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-gold-400" : "bg-obsidian-100"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Steps */}
        <div className="lg:col-span-2">

          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6">
                <FiTruck className="text-gold-500" size={20} />
                <h2 className="font-display text-xl text-obsidian-900">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "fullName", label: "Full Name",    placeholder: "Priya Sharma",      sm: 2 },
                  { field: "phone",    label: "Phone Number", placeholder: "9876543210"           },
                  { field: "address",  label: "Address",      placeholder: "Flat 4B, Green Park", sm: 2 },
                  { field: "city",     label: "City",         placeholder: "Mumbai"               },
                  { field: "state",    label: "State",        placeholder: "Maharashtra"          },
                  { field: "pincode",  label: "Pincode",      placeholder: "400001"               },
                ].map(({ field, label, placeholder, sm }) => (
                  <div key={field} className={sm === 2 ? "sm:col-span-2" : ""}>
                    <label className="font-sans text-xs text-obsidian-500 uppercase tracking-wider mb-1.5 block">
                      {label}
                    </label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={address[field]}
                      onChange={updateAddress(field)}
                      className="form-input"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => { if (validateAddress()) setStep(1); }}
                className="btn-gold mt-6 w-full py-3.5"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-6">
                <FiCreditCard className="text-gold-500" size={20} />
                <h2 className="font-display text-xl text-obsidian-900">Payment Method</h2>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? "border-gold-500 bg-gold-50"
                        : "border-obsidian-100 hover:border-gold-300"
                    }`}
                  >
                    <input
                      type="radio" name="payment" value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-gold-500"
                    />
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-sans text-sm font-medium text-obsidian-800">{m.label}</span>
                    {m.id !== "cod" && (
                      <span className="ml-auto badge bg-blue-100 text-blue-600 text-[10px]">Mock</span>
                    )}
                  </label>
                ))}
              </div>

              {paymentMethod !== "cod" && (
                <div className="bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm font-sans mb-6">
                  💡 This is a mock payment for demo. No real transaction will occur.
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3.5">← Back</button>
                <button onClick={() => setStep(2)} className="btn-gold flex-1 py-3.5">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
              <h2 className="font-display text-xl text-obsidian-900 mb-6">Review Your Order</h2>

              {/* Address summary */}
              <div className="bg-obsidian-50 rounded-xl p-4 mb-5">
                <p className="font-sans text-xs text-obsidian-400 uppercase tracking-wider mb-2">Delivering to</p>
                <p className="font-sans text-sm text-obsidian-800 font-medium">{address.fullName}</p>
                <p className="font-sans text-sm text-obsidian-600">
                  {address.address}, {address.city}, {address.state} – {address.pincode}
                </p>
                <p className="font-sans text-sm text-obsidian-600">📞 {address.phone}</p>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {items.map(({ product, qty }) => {
                  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
                  return (
                    <div key={product._id} className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || "https://placehold.co/60x60/f5f0e8/b8960c?text=💍"}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-obsidian-50 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-obsidian-900 font-medium truncate">{product.name}</p>
                        <p className="font-sans text-xs text-obsidian-400">Qty: {qty}</p>
                      </div>
                      <span className="font-sans text-sm font-semibold">{formatPrice(price * qty)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3.5">← Back</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-gold flex-1 py-3.5 gap-2 disabled:opacity-60"
                >
                  <FiLock size={15} />
                  {loading ? "Placing..." : `Place Order • ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
            <h3 className="font-display text-lg text-obsidian-900 mb-4">Summary</h3>
            <div className="space-y-2.5 text-sm font-sans mb-4">
              <div className="flex justify-between text-obsidian-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-obsidian-600"><span>Shipping</span><span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-obsidian-600"><span>GST</span><span>{formatPrice(tax)}</span></div>
              <div className="border-t border-obsidian-100 pt-2.5 flex justify-between font-semibold text-obsidian-900 text-base">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-sans text-obsidian-400">
              <FiLock size={11} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
