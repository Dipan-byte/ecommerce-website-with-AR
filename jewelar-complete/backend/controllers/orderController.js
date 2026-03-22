// controllers/orderController.js — Create, Get, Update Orders

const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Calculate prices from DB (never trust client prices)
  let itemsTotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsTotal += price * item.qty;
    enrichedItems.push({
      product: product._id,
      name:    product.name,
      image:   product.images[0] || "",
      price,
      qty:     item.qty,
    });
  }

  const shippingPrice = itemsTotal > 5000 ? 0 : 199; // free shipping above ₹5000
  const taxPrice      = Math.round(itemsTotal * 0.03); // 3% GST (mock)
  const totalPrice    = itemsTotal + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    paidAt: paymentMethod !== "cod" ? new Date() : undefined,
  });

  // Reduce stock
  for (const item of enrichedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty },
    });
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name images");

  res.json({ success: true, orders });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Users can only see their own orders; admins can see all
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, order });
});

// ─── Admin Routes ──────────────────────────────────────────────────────────────

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page  = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;

  const total  = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email");

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus || order.orderStatus;
  if (trackingId) order.trackingId = trackingId;
  if (orderStatus === "delivered") order.deliveredAt = new Date();

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// @desc    Get order stats for dashboard (Admin)
// @route   GET /api/orders/stats
// @access  Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders  = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const pendingOrders = await Order.countDocuments({ orderStatus: "placed" });
  const delivered     = await Order.countDocuments({ orderStatus: "delivered" });

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      delivered,
    },
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
