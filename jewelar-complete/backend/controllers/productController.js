// controllers/productController.js — Full CRUD + Search/Filter

const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page     = Number(req.query.page) || 1;
  const limit    = Number(req.query.limit) || 12;
  const skip     = (page - 1) * limit;

  // Build filter object
  const filter = { isActive: true };

  if (req.query.category)  filter.category = req.query.category;
  if (req.query.tryOnType) filter.tryOnType = req.query.tryOnType;
  if (req.query.featured)  filter.featured  = req.query.featured === "true";

  if (req.query.search) {
    filter.$or = [
      { name:        { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Sort
  let sortOption = {};
  switch (req.query.sort) {
    case "price_asc":    sortOption = { price: 1 };       break;
    case "price_desc":   sortOption = { price: -1 };      break;
    case "newest":       sortOption = { createdAt: -1 };  break;
    case "top_rated":    sortOption = { rating: -1 };     break;
    default:             sortOption = { createdAt: -1 };
  }

  const total    = await Product.countDocuments(filter);
  const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true, isActive: true }).limit(8);
  res.json({ success: true, products });
});

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, discountPrice, category,
    material, weight, stock, tryOnType, tryOnAsset, featured,
  } = req.body;

  // Images uploaded via Cloudinary come in req.files
  const images = req.files?.map((f) => f.path) || [];

  const product = await Product.create({
    name, description,
    price:         Number(price),
    discountPrice: Number(discountPrice) || 0,
    category,
    material,
    weight,
    stock:         Number(stock),
    images,
    tryOnType:     tryOnType || null,
    tryOnAsset:    tryOnAsset || null,
    featured:      featured === "true" || featured === true,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const {
    name, description, price, discountPrice, category,
    material, weight, stock, tryOnType, tryOnAsset, featured, isActive,
  } = req.body;

  // New images uploaded
  const newImages = req.files?.map((f) => f.path) || [];

  product.name          = name          ?? product.name;
  product.description   = description   ?? product.description;
  product.price         = price         ? Number(price)         : product.price;
  product.discountPrice = discountPrice ? Number(discountPrice) : product.discountPrice;
  product.category      = category      ?? product.category;
  product.material      = material      ?? product.material;
  product.weight        = weight        ?? product.weight;
  product.stock         = stock         ? Number(stock)         : product.stock;
  product.tryOnType     = tryOnType     ?? product.tryOnType;
  product.tryOnAsset    = tryOnAsset    ?? product.tryOnAsset;
  product.featured      = featured      !== undefined ? (featured === "true" || featured === true) : product.featured;
  product.isActive      = isActive      !== undefined ? (isActive === "true" || isActive === true)  : product.isActive;

  if (newImages.length > 0) {
    product.images = [...product.images, ...newImages];
  }

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc    Delete product (Admin) — soft delete
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product deleted" });
});

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  product.reviews.push({
    user:    req.user._id,
    name:    req.user.name,
    rating:  Number(rating),
    comment,
  });

  await product.save();
  res.status(201).json({ success: true, message: "Review added" });
});

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
