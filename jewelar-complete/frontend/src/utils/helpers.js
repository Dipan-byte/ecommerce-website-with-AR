// src/utils/helpers.js

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  });

export const getDiscountPercent = (original, discounted) =>
  discounted > 0 ? Math.round(((original - discounted) / original) * 100) : 0;

export const truncate = (str, n) =>
  str?.length > n ? str.slice(0, n) + "…" : str;

export const categoryLabel = (cat) => ({
  earrings:    "Earrings",
  necklaces:   "Necklaces",
  "nose-pins": "Nose Pins",
  rings:       "Rings",
  bracelets:   "Bracelets",
  bangles:     "Bangles",
  other:       "Other",
}[cat] || cat);

export const statusColor = (status) => ({
  placed:    "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}[status] || "bg-gray-100 text-gray-700");