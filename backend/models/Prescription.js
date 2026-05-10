// models/Prescription.js

import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      // The customer who uploaded the prescription
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      // The order this prescription is associated with
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: true,
    },
    imageUrl: {
      // URL of the image stored on Cloudinary
      type: String,
      required: [true, "Prescription image URL is required."],
    },
    publicId: {
      // Public ID from Cloudinary, for asset management (e.g., deletion)
      type: String,
      required: [true, "Cloudinary public ID is required."],
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      // Admin or Shop Owner who reviewed it
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    remarks: {
      // Notes from the reviewer, e.g., reason for rejection
      type: String,
      trim: true,
      maxlength: [200, "Remarks cannot be more than 200 characters."],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
