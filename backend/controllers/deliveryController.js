// controllers/deliveryController.js

import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import OTP from "../models/otp.js";
import otpGenerator from "otp-generator";
import sendEmail from "../utils/otpemail.js";

export const getAvailableTasks = asyncHandler(async (req, res) => {
  const tasks = await Order.find({
    orderStatus: "Ready for Pickup",
    orderType: "Home Delivery",
    deliveryStaff: { $exists: false },
  })
    .populate("shop", "name address phone")
    .populate("user", "name");
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

export const getMyActiveTasks = asyncHandler(async (req, res) => {
  const tasks = await Order.find({
    deliveryStaff: req.user._id,
    orderStatus: { $in: ["Shipped", "Out for Delivery"] },
  })
    .populate("shop", "name address phone")
    .populate("user", "name phone");
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// Atomically accept a task
export const acceptTask = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const deliveryStaffId = req.user._id;

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: "Ready for Pickup",
      orderType: "Home Delivery",
      deliveryStaff: { $exists: false },
    },
    { $set: { deliveryStaff: deliveryStaffId, orderStatus: "Shipped" } },
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error("This task is no longer available.");
  }
  res
    .status(200)
    .json({ success: true, message: "Task accepted!", data: order });
});

// A single function to update delivery status
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findOne({
    _id: req.params.orderId,
    deliveryStaff: req.user._id,
  });
  if (!order) throw new Error("Order not found or not assigned to you.");

  order.orderStatus = status;
  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  const updatedOrder = await order.save();
  res.status(200).json({ success: true, data: updatedOrder });
});

export const getMyAssignedTasks = asyncHandler(async (req, res) => {
  const tasks = await Order.find({
    deliveryStaff: req.user._id,
    orderStatus: { $in: ["Shipped", "Out for Delivery"] },
  })
    .populate("shop", "name address phone")
    .populate("user", "name phone");

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

export const getMyDeliveryHistory = asyncHandler(async (req, res) => {
  const history = await Order.find({
    deliveryStaff: req.user._id,
    orderStatus: { $in: ["Delivered", "Picked Up"] },
  })
    .sort({ deliveredAt: -1 })
    .populate("shop", "name address phone")
    .populate("user", "name phone");

  res.status(200).json({ success: true, count: history.length, data: history });
});

export const getActiveDeliveries = asyncHandler(async (req, res) => {
  const tasks = await Order.find({
    deliveryStaff: req.user._id,
    orderStatus: "Out for Delivery",
  })
    .populate("shop", "name address phone")
    .populate("user", "name phone");
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryStaff: req.user._id, // Ensure they can only get their own tasks
  })
    .populate("user", "name")
    .populate("shop", "name address");

  if (!order) {
    res.status(404);
    throw new Error("Order not found or not assigned to you.");
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const updateOrderStatusToPickedUp = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryStaff: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found or not assigned to you.");
  }

  if (order.orderStatus !== "Assigned to Delivery") {
    res.status(400);
    throw new Error(
      `Order cannot be picked up. Current status: ${order.orderStatus}`
    );
  }

  order.orderStatus = "Shipped";
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Order marked as picked up and is on the way.",
    data: updatedOrder,
  });
});

export const updateOrderStatusToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryStaff: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found or not assigned to you.");
  }

  if (order.orderStatus !== "Shipped") {
    res.status(400);
    throw new Error(
      `Order cannot be delivered. Current status: ${order.orderStatus}`
    );
  }

  order.orderStatus = "Delivered";
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Order successfully delivered.",
    data: updatedOrder,
  });
});

export const getPickupTasks = asyncHandler(async (req, res) => {
  const tasks = await Order.find({
    deliveryStaff: req.user._id,
    orderStatus: "Shipped",
  })
    .populate("shop", "name address phone")
    .populate("user", "name phone");
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

export const sendDeliveryOtp = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate(
    "user",
    "email"
  );
  if (!order) throw new Error("Order not found.");

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });


  // Store OTP with the order ID for verification
  await OTP.create({ email: order.user.email, otp, order: order._id });

  try {
    await sendEmail({
      to: order.user.email,
      subject: `OTP for your Order #${order._id}`,
      message: `Your One-Time Password (OTP) to confirm delivery is: ${otp}.`,
    });
    res
      .status(200)
      .json({ success: true, message: "Delivery OTP sent to customer!" });
  } catch (error) {
    console.log(error.message);
    throw new Error("Could not send OTP email.");
  }
});

// Verify delivery OTP and mark order as Delivered
export const verifyDeliveryOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const order = await Order.findById(req.params.orderId).populate(
    "user",
    "email"
  );

  const otpRecord = await OTP.findOne({
    email: order.user.email,
    otp,
    order: order._id,
  });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP.");
  }

  // OTP is correct, update the order
  order.orderStatus = "Delivered";
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  await order.save();

  await OTP.deleteOne({ _id: otpRecord._id });

  res
    .status(200)
    .json({ success: true, message: "Order successfully delivered!" });
});
