// controllers/adminController.js

import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getAllOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Order.find(), req.query).sort().paginate();

  const orders = await features.query.populate("user", "name"); // Populate user name

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export const getAllReviewsAndComplaints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.reviewType) filter.reviewType = req.query.reviewType;
  if (req.query.complaintStatus)
    filter.complaintStatus = req.query.complaintStatus;

  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .populate("shop", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

export const updateReviewOrComplaint = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) throw new Error("Review or complaint not found.");
  res.status(200).json({ success: true, data: review });
});

export const deleteReviewOrComplaint = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new Error("Review or complaint not found.");

  await review.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

export const getAllShops = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const shops = await Shop.find(filter).populate("owner", "name email");
  res.status(200).json({ success: true, count: shops.length, data: shops });
});

// --- Dashboard ---
export const getDashboardStats = asyncHandler(async (req, res) => {
  // THE FIX IS HERE: Exclude users with the 'admin' role from the count
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

  const totalShops = await Shop.countDocuments({ status: "Approved" });
  const totalOrders = await Order.countDocuments();

  // Calc total revenue using aggregation
  const revenueStats = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { 
        _id: null, 
        totalRevenue: { $sum: "$pricing.totalPrice" },
        adminCommission: { $sum: "$pricing.adminCommission" },
        shopPayout: { $sum: "$pricing.shopPayout" },
        deliveryPayout: { $sum: "$pricing.deliveryPayout" },
      } 
    },
  ]);
  const totalRevenue = revenueStats[0]?.totalRevenue || 0;
  const adminCommission = revenueStats[0]?.adminCommission || 0;
  const shopPayout = revenueStats[0]?.shopPayout || 0;
  const deliveryPayout = revenueStats[0]?.deliveryPayout || 0;

  const shopStats = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: {
        _id: "$shop",
        orderCount: { $sum: 1 },
        totalPayout: { $sum: "$pricing.shopPayout" }
    }},
    { $lookup: { from: "shops", localField: "_id", foreignField: "_id", as: "shopDetails" } },
    { $unwind: "$shopDetails" },
    { $project: {
        shopName: "$shopDetails.name",
        orderCount: 1,
        totalPayout: 1
    }}
  ]);

  res.status(200).json({
    success: true,
    data: { 
      totalUsers, totalShops, totalOrders, totalRevenue,
      adminCommission, shopPayout, deliveryPayout, shopStats
    },
  });
});

// --- User Management ---

export const getAllUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter);
  res.status(200).json({ success: true, count: users.length, data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  // Fields that admin is allowed to update
  const { name, email, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Also delete their shop if they were a shop-owner
  if (user.role === "shop-owner") {
    await Shop.deleteOne({ owner: user._id });
  }

  res.status(200).json({ success: true, message: "User removed" });
});

// --- Shop Management ---

export const getPendingShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find({ status: "Pending" }).populate(
    "owner",
    "name email"
  );
  res.status(200).json({ success: true, count: shops.length, data: shops });
});

export const approveShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(
    req.params.id,
    { status: "Approved" },
    { new: true }
  );
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found");
  }
  res.status(200).json({ success: true, message: "Shop approved", data: shop });
});

export const rejectShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(
    req.params.id,
    { status: "Rejected" },
    { new: true }
  );
  if (!shop) {
    res.status(404);
    throw new Error("Shop not found");
  }
  res.status(200).json({ success: true, message: "Shop rejected", data: shop });
});

// --- Complaint Management ---

export const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Review.find({ reviewType: "Complaint" }).populate(
    "user",
    "name"
  );
  res
    .status(200)
    .json({ success: true, count: complaints.length, data: complaints });
});

export const resolveComplaint = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  if (!reply) {
    res.status(400);
    throw new Error("Admin reply is required to resolve a complaint.");
  }

  const complaint = await Review.findByIdAndUpdate(
    req.params.id,
    { complaintStatus: "Resolved", adminReply: reply },
    { new: true }
  );

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }
  res
    .status(200)
    .json({ success: true, message: "Complaint resolved", data: complaint });
});

export const getPayoutsData = asyncHandler(async (req, res) => {
  // Aggregate payouts for shops
  const shopPayouts = await Order.aggregate([
    { $match: { orderStatus: { $in: ["Delivered", "Picked Up", "Shipped"] }, isPaid: true } },
    { $group: {
        _id: "$shop",
        totalOrders: { $sum: 1 },
        totalItemsPrice: { $sum: "$pricing.itemsPrice" },
        totalAdminCommission: { $sum: "$pricing.adminCommission" },
        totalShopPayout: { $sum: "$pricing.shopPayout" },
        pendingShopPayout: {
          $sum: { $cond: [{ $eq: ["$isShopPaid", false] }, "$pricing.shopPayout", 0] }
        }
    }},
    { $lookup: { from: "shops", localField: "_id", foreignField: "_id", as: "shopDetails" } },
    { $unwind: "$shopDetails" },
    { $lookup: { from: "users", localField: "shopDetails.owner", foreignField: "_id", as: "ownerDetails" } },
    { $unwind: "$ownerDetails" },
    { $project: {
        shopId: "$_id",
        shopName: "$shopDetails.name",
        ownerName: "$ownerDetails.name",
        bankDetails: "$ownerDetails.bankDetails",
        totalOrders: 1,
        totalItemsPrice: 1,
        totalAdminCommission: 1,
        totalShopPayout: 1,
        pendingShopPayout: 1
    }}
  ]);

  // Aggregate payouts for delivery boys
  const deliveryPayouts = await Order.aggregate([
    { $match: { orderStatus: { $in: ["Delivered", "Picked Up"] }, deliveryStaff: { $exists: true } } },
    { $group: {
        _id: "$deliveryStaff",
        totalDeliveries: { $sum: 1 },
        totalDeliveryPayout: { $sum: { $ifNull: ["$pricing.deliveryPayout", 30] } },
        pendingDeliveryPayout: {
          $sum: { $cond: [{ $eq: ["$isDeliveryStaffPaid", false] }, { $ifNull: ["$pricing.deliveryPayout", 30] }, 0] }
        }
    }},
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "staffDetails" } },
    { $unwind: "$staffDetails" },
    { $project: {
        staffId: "$_id",
        staffName: "$staffDetails.name",
        bankDetails: "$staffDetails.bankDetails",
        totalDeliveries: 1,
        totalDeliveryPayout: 1,
        pendingDeliveryPayout: 1
    }}
  ]);

  res.status(200).json({
    success: true,
    data: { shopPayouts, deliveryPayouts }
  });
});

export const clearShopPayout = asyncHandler(async (req, res) => {
  const shopId = req.params.shopId;
  if (!shopId) {
    res.status(400);
    throw new Error('Shop ID is required');
  }

  // Update all unpaid orders for this shop
  const result = await Order.updateMany(
    { shop: shopId, isShopPaid: false, isPaid: true, orderStatus: { $in: ["Delivered", "Picked Up", "Shipped"] } },
    { $set: { isShopPaid: true } }
  );

  res.status(200).json({
    success: true,
    message: `Payout cleared for ${result.modifiedCount} orders.`
  });
});

export const clearDeliveryPayout = asyncHandler(async (req, res) => {
  const staffId = req.params.staffId;
  if (!staffId) {
    res.status(400);
    throw new Error('Delivery Staff ID is required');
  }

  // Update all unpaid deliveries for this staff
  const result = await Order.updateMany(
    { deliveryStaff: staffId, isDeliveryStaffPaid: false, orderStatus: { $in: ["Delivered", "Picked Up"] } },
    { $set: { isDeliveryStaffPaid: true } }
  );

  res.status(200).json({
    success: true,
    message: `Payout cleared for ${result.modifiedCount} deliveries.`
  });
});

export const getAdminReports = asyncHandler(async (req, res) => {
  const { startDate, endDate, reportType } = req.query;
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  if (reportType === 'sales') {
    // Only count paid orders
    const orders = await Order.find({ ...dateFilter, isPaid: true })
      .populate('shop', 'name')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.totalPrice || 0), 0);
    const totalAdminCommission = orders.reduce((sum, order) => sum + (order.pricing?.adminCommission || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        summary: { totalOrders: orders.length, totalRevenue, totalAdminCommission }
      }
    });
  }

  if (reportType === 'stock') {
    const products = await Product.find({}).populate('shop', 'name').populate('category', 'name').sort({ countInStock: 1 });
    
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
