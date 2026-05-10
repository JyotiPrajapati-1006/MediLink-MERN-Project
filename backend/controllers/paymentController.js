import Razorpay from "razorpay";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import config from "../config/index.js";
import { log } from "console";

const razorpay = new Razorpay({
  key_id: config.razorpay.key_id,
  key_secret: config.razorpay.key_secret,
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, receipt } = req.body;

  if (!amount || !currency || !receipt) {
    res.status(400);
    throw new Error("Amount, currency, and receipt are required.");
  }

  const options = {
    amount: Math.round(amount * 100), // Ensure amount is an integer (in paise)
    currency,
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error); // Log the actual error from Razorpay
    res.status(500);
    throw new Error("Failed to create Razorpay order.");
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.key_secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
  

    const ordersToUpdate = await Order.find({ _id: order_id });


    // Loop through each order and update it.
    for (const order of ordersToUpdate) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = { id: razorpay_payment_id, status: "Paid" };
      
      // Only change status to 'Processing' if it's not already waiting for a prescription.
      if (order.orderStatus !== "Awaiting Prescription Approval") {
        order.orderStatus = "Processing";
      }
      await order.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Payment verified and orders updated." });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed." });
  }
});
