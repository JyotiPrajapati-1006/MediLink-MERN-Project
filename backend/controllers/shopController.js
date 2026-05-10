// controllers/shopController.js

import asyncHandler from "express-async-handler";
import Shop from "../models/Shop.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Prescription from "../models/Prescription.js";
import User from "../models/User.js";

export const getAllShops = asyncHandler(async (req, res) => {
  const { latitude, longitude, distance } = req.query;
  let shops;

  if (latitude && longitude && distance) {
    // Geospatial Query
    const radius = Number(distance) / 6378.1; 
    shops = await Shop.find({
      status: "Approved",
      location: {
        $geoWithin: { $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radius] },
      },
    });
  } else {
    // Standard Query
    shops = await Shop.find({ status: "Approved" });
  }

  res.status(200).json({ success: true, count: shops.length, data: shops });
});

export const getShopById = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ _id: req.params.id, status: "Approved" });

  if (!shop) {
    res.status(404);
    throw new Error("Shop not found or is not approved.");
  }

  res.status(200).json({ success: true, data: shop });
});

// --- Protected Shop Owner Functions ---

export const createMyShop = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    street,
    city,
    state,
    postalCode,
    phone,
    email,
    deliveryRadius,
    coordinates,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("At least one shop image is required.");
  }

  const imageUrls = req.files.map((file) => file.path);

  const shopData = {
    owner: req.user._id,
    name,
    description,
    phone,
    email,
    deliveryRadius,
    images: imageUrls,
    address: {
      street,
      city,
      state,
      postalCode,
    },
    location: {
      type: "Point",
      coordinates: coordinates ? JSON.parse(coordinates) : [0, 0],
    },
  };

  const shop = await Shop.create(shopData);

  res.status(201).json({ success: true, data: shop });
});

export const getMyShopDashboard = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop profile not found for this user.");
  }
  res.status(200).json({ success: true, data: shop });
});

export const updateMyShop = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  updateData.address = {
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    postalCode: req.body.postalCode,
  };

  // If new images were uploaded, add them to the update object
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map((file) => file.path);
  }

  // Find the shop by the owner's ID and update it with the new data
  const shop = await Shop.findOneAndUpdate(
    { owner: req.user._id },
    updateData,
    {
      new: true, // Return the updated document
      runValidators: true,
    }
  );

  if (!shop) {
    res.status(404);
    throw new Error("Shop profile not found for this user.");
  }

  res.status(200).json({ success: true, data: shop });
});

export const getMyShopOrders = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found for this user.");
  }
  const filter = { shop: shop._id };

  if (req.query.status) {
    filter.orderStatus = req.query.status;
  }
  
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name");

  res.status(200).json({ success: true, count: orders.length, data: orders });
});


export const updateOrderStatus = asyncHandler(async (req, res) => {

  const { status } = req.body;

  const order = await Order.findById(req.params.orderId);

  const shop = await Shop.findOne({ owner: req.user._id });
  if (!order || order.shop.toString() !== shop._id.toString()) {
    res.status(404);
    throw new Error("Order not found in your shop.");
  }

  order.orderStatus = status;

  const updatedOrder = await order.save();


  res.status(200).json({ success: true, data: updatedOrder });
});

export const getMyShopPrescriptions = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found." });

  const shopOrders = await Order.find({ shop: shop._id }).select("_id");
  const orderIds = shopOrders.map((o) => o._id);

  // Create a filter object for prescriptions
  const filter = { order: { $in: orderIds } };
  // If a status is provided in the query, add it to the filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const prescriptions = await Prescription.find(filter)
    .populate("user", "name")
    .populate({
      path: "order",
      select: "orderItems",
    })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: prescriptions.length, data: prescriptions });
});

export const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const prescription = await Prescription.findById(req.params.prescriptionId);

  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found.");
  }

  prescription.status = status;
  prescription.remarks = remarks || "";
  prescription.reviewedBy = req.user._id;
  await prescription.save();

  if (status === "Approved") {
    await Order.findByIdAndUpdate(prescription.order, {
      orderStatus: "Processing",
    });
  } else if (status === "Rejected") {
    await Order.findByIdAndUpdate(prescription.order, {
      orderStatus: "Rejected",
    });
  }

  res.status(200).json({ success: true, data: prescription });
});

export const getAvailableDeliveryStaff = asyncHandler(async (req, res) => {
  const deliveryStaff = await User.find({
    role: "delivery-staff",
    isActive: true,
  });
  res.status(200).json({ success: true, data: deliveryStaff });
});

export const getMyShopDashboardData = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found for this user.");
  }

  // --- Calculate all stats for the specific shop ---
  const totalProducts = await Product.countDocuments({ shop: shop._id });
  const totalOrders = await Order.countDocuments({ shop: shop._id });

  const revenueStats = await Order.aggregate([
    { $match: { shop: shop._id, isPaid: true } },
    { $group: { 
        _id: null, 
        totalRevenue: { $sum: "$pricing.shopPayout" },
        pendingPayout: {
          $sum: { $cond: [{ $eq: ["$isShopPaid", false] }, "$pricing.shopPayout", 0] }
        }
    } },
  ]);
  const totalRevenue = revenueStats[0]?.totalRevenue || 0;
  const pendingPayout = revenueStats[0]?.pendingPayout || 0;

  const recentOrders = await Order.find({ shop: shop._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name");

  // NEW: Calculate pending prescriptions count
  const shopOrders = await Order.find({ shop: shop._id }).select("_id");
  const orderIds = shopOrders.map((o) => o._id);
  const pendingPrescriptions = await Prescription.countDocuments({
    order: { $in: orderIds },
    status: "Pending",
  });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingPayout,
      recentOrders,
      pendingPrescriptions,
    },
  });
});

export const getShopReports = asyncHandler(async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found");
  }

  const { startDate, endDate, reportType } = req.query;
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const dateFilter = { shop: shop._id, createdAt: { $gte: start, $lte: end } };

  if (reportType === 'sales') {
    const orders = await Order.find({ ...dateFilter, isPaid: true })
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.shopPayout || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        summary: { totalOrders: orders.length, totalRevenue }
      }
    });
  }

  if (reportType === 'stock') {
    const products = await Product.find({ shop: shop._id }).populate('category', 'name').sort({ countInStock: 1 });
    
    const safeProducts = products.map(p => {
      const pObj = p.toObject();
      let totalStock = pObj.countInStock || 0;
      if (pObj.variants && pObj.variants.length > 0) {
        totalStock = pObj.variants.reduce((acc, v) => acc + (v.countInStock || 0), 0);
      }
      pObj.countInStock = Math.max(0, totalStock);
      return pObj;
    });

    return res.status(200).json({
      success: true,
      data: {
        products: safeProducts,
        totalProducts: safeProducts.length
      }
    });
  }

  res.status(400);
  throw new Error("Invalid report type. Please use 'sales' or 'stock'.");
});
