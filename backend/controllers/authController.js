// controllers/authController.js

import crypto from "crypto";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import otpGenerator from "otp-generator";
import OTP from "../models/otp.js";
import sendEmail from "../utils/otpemail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body; // This is the token from Google

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { name, email } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: crypto.randomBytes(16).toString("hex"),
      role: "customer", // Default role
    });
  }

  if (user && user.role !== "customer") {
    res.status(403);
    throw new Error(
      "An account with this email exists but is not a customer account."
    );
  }

  const token = generateToken(user._id);
  const userWithoutPassword = await User.findById(user._id);

  res.status(200).json({
    success: true,
    token,
    data: userWithoutPassword,
  });
});

export const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists.");
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  await OTP.create({ email, otp });

  try {
    await sendEmail({
      to: email,
      subject: "Your OTP for MediLink Registration",
      message: `Your One-Time Password (OTP) is: ${otp}. It is valid for 10 minutes.`,
    });
    res
      .status(200)
      .json({ success: true, message: "OTP sent to your email successfully!" });
  } catch (error) {
    console.error("Email could not be sent for OTP:", error);
    throw new Error("Could not send OTP email. Please try again.");
  }
});

export const verifyOtpAndRegister = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, otp } = req.body;

  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP.");
  }

  const user = await User.create({ name, email, phone, password, role });

  // Clean up the OTP record
  await OTP.deleteOne({ email, otp });

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    data: user,
  });
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists.");
  }

  const user = await User.create({ name, email, password, role, phone });

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    },
  });
});

export const sendPasswordlessLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Please provide an email.");

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email address.");
  }

  if (user.role !== "customer") {
    res.status(403);
    throw new Error(
      "This login is for customers only. Please use your specific portal to log in."
    );
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  await OTP.create({ email, otp });

  try {
    await sendEmail({
      to: email,
      subject: "Your Login OTP for MediLink",
      message: `Your One-Time Password (OTP) for login is: ${otp}.`,
    });
    res
      .status(200)
      .json({ success: true, message: "Login OTP sent successfully!" });
  } catch (error) {
    throw new Error("Could not send OTP email.");
  }
});

export const verifyPasswordlessLogin = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  await OTP.deleteOne({ email, otp });

  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    token,
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password.");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Incorrect email or password.");
  }

  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req object by the 'protect' middleware
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export const updateMyPassword = asyncHandler(async (req, res) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error("Your current password is wrong.");
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  // 4) Log user in, send JWT
  const token = generateToken(user._id);
  res.status(200).json({ success: true, token });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404);
    throw new Error("There is no user with that email address.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Your Password Reset Link (valid for 10 min)",
      message: `Hi ${user.name},<br><br>Forgot your password? Please click the button below to reset it. If you didn't request this, please ignore this email.`,
      actionText: "Reset Your Password",
      actionUrl: resetURL,
    });
    res.status(200).json({ success: true, message: "Token sent to email!" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("There was an error sending the email. Try again later!");
  }
});

//Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired.");
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({ success: true, token, data: user });
});
