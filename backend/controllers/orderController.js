// controllers/orderController.js

import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Prescription from "../models/Prescription.js";


export const createSplitOrder = asyncHandler(async (req, res) => {
  // 1. Get data from the frontend
  const { orderItems, shippingAddress, paymentMethod, pricing } = req.body;

  // 2. Group items by their shop ID
  const ordersByShop = orderItems.reduce((acc, item) => {
    const shopId = item.shop._id;
    if (!acc[shopId]) {
      acc[shopId] = [];
    }
    acc[shopId].push(item);
    return acc;
  }, {});

  const createdOrders = [];
  let grandTotalAmount = 0;

  // 3. Loop through each shop group and create a separate order
  for (const shopId in ordersByShop) {
    const itemsForShop = ordersByShop[shopId];

    // --- THIS IS THE FINAL FIX ---
    // 4. Format the items to match the OrderItemSchema EXACTLY
    const formattedItems = itemsForShop.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      product: item.product, // The product ID is already in the 'product' field
    }));

    // 5. Calculate the sub-total for this specific shop's order
    const subTotalPrice = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    grandTotalAmount += subTotalPrice;
    
    // We get coupon logic per shop? Wait, split orders don't easily have shop specific coupons applied right now, but assuming no coupon
    const couponDiscount = 0; // Simple fallback 
    const GST_PERCENTAGE = 12;
    const handlingFee = 10;
    const platformFee = 6;
    
    const taxableAmount = subTotalPrice - couponDiscount;
    const gstAmount = taxableAmount > 0 ? (taxableAmount * GST_PERCENTAGE) / 100 : 0;
    
    // Split the revenue after coupon exactly 70(Shop) / 30(Admin).
    const adminCommission = (taxableAmount * 0.30) + handlingFee + platformFee + 10 + gstAmount;
    const shopPayout = (taxableAmount * 0.70);
    const deliveryPayout = 30;

    // 6. Create the new order with the cleaned and formatted data
    const order = new Order({
      user: req.user._id,
      shop: shopId,
      orderItems: formattedItems, // Use the formatted items
      shippingAddress,
      paymentMethod,
      pricing: {
        itemsPrice: subTotalPrice,
        totalPrice: subTotalPrice + handlingFee + platformFee + 40 + gstAmount,
        mrpTotal: subTotalPrice,
        totalDiscountOnMrp: 0,
        handlingFee: handlingFee,
        platformFee: platformFee,
        deliveryFee: 40,
        taxPrice: gstAmount,
        couponDiscount: couponDiscount,
        adminCommission: adminCommission,
        shopPayout: shopPayout,
        deliveryPayout: deliveryPayout
      },
    });

    const createdOrder = await order.save();
    createdOrders.push(createdOrder);
  }

  // 7. Decrement stock for all ordered items
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(0, product.countInStock - item.quantity);
      await product.save({ validateBeforeSave: false });
    }
  }

  // 8. Send back a successful response
  res.status(201).json({
    success: true,
    message: `${createdOrders.length} separate orders created successfully.`,
    data: {
      orders: createdOrders,
      totalAmount: grandTotalAmount,
    },
  });
});


export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, pricing, paymentMethod, shopId, orderType } =
    req.body;

  if (!orderItems || !pricing || !shopId || !orderType) {
    res.status(400);
    throw new Error("Missing required order data.");
  }
  if (orderType === 'Home Delivery' && !shippingAddress) {
    res.status(400);
    throw new Error("Home delivery requires a shipping address.");
  }

  const parsedOrderItems = JSON.parse(orderItems);
  const parsedShippingAddress = (shippingAddress && shippingAddress !== 'undefined') ? JSON.parse(shippingAddress) : undefined;
  const parsedPricing = JSON.parse(pricing);

  // Compute actual subtotal
  const computedItemsPrice = parsedOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Extract fees & discounts from frontend provided pricing
  const couponDiscount = parsedPricing.couponDiscount || 0;
  const handlingFee = parsedPricing.handlingFee || 0;
  const platformFee = parsedPricing.platformFee || 0;
  // Fallback flat 40 if not provided
  const deliveryFee = parsedPricing.deliveryFee ?? 40; 

  // Payout Math based on rules
  const netItemsRevenue = computedItemsPrice - couponDiscount; // Apply coupon to items proportionally
  
  // Admin: 30% of net items + Platform fees + (10 Rs from delivery if applicable) + GST
  const gstAmount = parsedPricing.gstAmount || parsedPricing.taxPrice || 0;
  const deliveryAdminCut = orderType === 'Home Delivery' ? 10 : 0;
  const adminCommission = (netItemsRevenue * 0.30) + handlingFee + platformFee + deliveryAdminCut + gstAmount;
  
  // Shop: 70% of net items
  const shopPayout = (netItemsRevenue * 0.70);
  
  // Delivery Boy: Fixed Rs 30 payout ONLY if it's a delivery
  const deliveryPayout = orderType === 'Home Delivery' ? 30 : 0;

  // Enhance pricing object with DB breakdown
  parsedPricing.adminCommission = adminCommission;
  parsedPricing.shopPayout = shopPayout;
  parsedPricing.deliveryPayout = deliveryPayout;
  parsedPricing.taxPrice = parsedPricing.gstAmount || 0; // Ensure taxPrice is correctly set from gstAmount

  const order = new Order({
    user: req.user._id,
    orderItems: parsedOrderItems,
    shippingAddress: parsedShippingAddress,
    pricing: parsedPricing,
    shop: shopId,
    paymentMethod: paymentMethod,
    orderType: orderType,
  });

  // --- THIS IS THE CRITICAL FIX ---
  // If a prescription file was uploaded by multer, req.file will exist.
  if (req.file) {
    // Set the order status BEFORE saving
    order.orderStatus = "Awaiting Prescription Approval";
    const createdOrder = await order.save(); // Save the order first to get its _id

    // Then create the prescription and link it to the order
    const prescription = await Prescription.create({
      user: req.user._id,
      order: createdOrder._id,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });

    // Link the prescription back to the order and save again
    createdOrder.prescription = prescription._id;
    await createdOrder.save();

    // Decrement stock logic...
    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock = Math.max(0, product.countInStock - item.quantity);
        await product.save({ validateBeforeSave: false });
      }
    }

    res.status(201).json({ success: true, data: createdOrder });
  } else {
    // If no prescription file, save the order directly
    const createdOrder = await order.save();
    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock = Math.max(0, product.countInStock - item.quantity);
        await product.save({ validateBeforeSave: false });
      }
    }
    res.status(201).json({ success: true, data: createdOrder });
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("shop", "name address phone")
    .populate("orderItems.product", "images")
    .populate("prescription");

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  // Check authorization: user must be the order owner, shop owner, or an admin
  const shop = await Shop.findById(order.shop);
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isShopOwner = shop.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isShopOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this order.");
  }

  res.status(200).json({ success: true, data: order });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  // Business logic: only cancel if order is in a cancellable state
  if (
    ["Shipped", "Delivered", "Cancelled", "Rejected"].includes(
      order.orderStatus
    )
  ) {
    res.status(400);
    throw new Error(
      `Order is already ${order.orderStatus} and cannot be cancelled.`
    );
  }

  order.orderStatus = "Cancelled";
  const updatedOrder = await order.save();

  // Increment stock back
  for (const item of updatedOrder.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: item.quantity },
    });
  }

  res.status(200).json({
    success: true,
    message: "Order has been cancelled.",
    data: updatedOrder,
  });
});
