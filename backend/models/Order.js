// models/Order.js

import mongoose from "mongoose";

// Sub-schema for individual items within an order
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price at the time of order
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      // Customer who placed the order
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      // Medical shop the order is for
      type: mongoose.Schema.ObjectId,
      ref: "Shop",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: function() { return this.orderType === 'Home Delivery'; } },
      city: { type: String, required: function() { return this.orderType === 'Home Delivery'; } },
      postalCode: { type: String, required: function() { return this.orderType === 'Home Delivery'; } },
      state: { type: String, required: function() { return this.orderType === 'Home Delivery'; } },
    },
    orderType: {
      type: String,
      required: true,
      enum: ["Home Delivery", "Pickup Reservation"],
      default: "Home Delivery",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Online", "COD"], // Cash on Delivery [cite: 20]
    },
    paymentResult: {
      // Details from payment gateway
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
    },
    pricing: {
      itemsPrice: { type: Number, required: true, default: 0.0 },
      taxPrice: { type: Number, required: true, default: 0.0 },
      shippingPrice: { type: Number, required: true, default: 0.0 },
      discount: { type: Number, required: true, default: 0.0 },
      totalPrice: { type: Number, required: true, default: 0.0 },
      mrpTotal: { type: Number, default: 0.0 },
      totalDiscountOnMrp: { type: Number, default: 0.0 },
      handlingFee: { type: Number, default: 0.0 },
      platformFee: { type: Number, default: 0.0 },
      deliveryFee: { type: Number, default: 0.0 },
      couponDiscount: { type: Number, default: 0.0 },
      adminCommission: { type: Number, default: 0.0 },
      shopPayout: { type: Number, default: 0.0 },
      deliveryPayout: { type: Number, default: 0.0 },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        // Reflects order flow [cite: 121, 122]
        "Pending",
        "Awaiting Prescription Approval",
        "Processing", // Approved / Accepted
        "Ready for Pickup",
        "Assigned to Delivery",
        "Shipped",
        "Out for Delivery", // On the way
        "Delivered",
        "Picked Up",
        "Cancelled",
        "Rejected",
      ],
      default: "Pending",
    },
    prescription: {
      type: mongoose.Schema.ObjectId,
      ref: "Prescription",
    },
    deliveryStaff: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    qrCode: {
      // For pickup orders [cite: 51]
      type: String,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isShopPaid: { type: Boolean, default: false },
    isDeliveryStaffPaid: { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
