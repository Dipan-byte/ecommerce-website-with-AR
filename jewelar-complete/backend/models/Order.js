// models/Order.js — Order Schema

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  image:    { type: String, required: true },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, default: 1 },
});

const addressSchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  phone:     { type: String, required: true },
  address:   { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  country:   { type: String, default: "India" },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    paymentMethod: {
      type: String,
      enum: ["cod", "mock_upi", "mock_card"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    itemsTotal:    { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice:      { type: Number, default: 0 },
    totalPrice:    { type: Number, required: true },
    paidAt:        { type: Date },
    deliveredAt:   { type: Date },
    trackingId:    { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
