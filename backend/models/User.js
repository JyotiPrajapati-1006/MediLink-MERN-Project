// models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Sub-schema for customer addresses
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email."],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false, // Do not send password in query results by default
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "shop-owner", "delivery-staff", "admin"],
      default: "customer",
    },
    addresses: [addressSchema], // Array of addresses for customers
    isActive: {
      // Allows admin to ban/unban users
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    // Fields for password reset functionality
    passwordResetToken: String,
    passwordResetExpires: Date,
    bankDetails: {
      accountName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

userSchema.add({
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Middleware to hash password before saving the user document
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with a cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Instance method to compare entered password with the hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' is available here despite select: false
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
