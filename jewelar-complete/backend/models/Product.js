// models/Product.js — Product Schema

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["earrings", "necklaces", "nose-pins", "rings", "bracelets", "bangles", "other"],
    },
    material: {
      type: String,
      default: "",
    },
    weight: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [
      {
        type: String, // Cloudinary URL
      },
    ],
    // AR Try-On fields
    tryOnAsset: {
      type: String, // Cloudinary URL of transparent PNG for overlay
      default: null,
    },
    tryOnType: {
      type: String,
      enum: ["earring", "nose", "necklace", null],
      default: null,
    },
    reviews: [reviewSchema],
    numReviews: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-update numReviews and rating after saving reviews
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
