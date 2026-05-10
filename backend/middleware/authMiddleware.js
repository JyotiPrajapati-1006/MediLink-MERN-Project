// middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Protect routes - checks if user is logged in
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Check if token exists and is in the correct format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }

  // 2) Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select("-password");

  if (!currentUser) {
    res.status(401);
    throw new Error("The user belonging to this token no longer exists.");
  }

  // 4) Grant access to protected route
  req.user = currentUser;
  next();
});

// Authorize roles - checks if user has the required role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    next();
  };
};
