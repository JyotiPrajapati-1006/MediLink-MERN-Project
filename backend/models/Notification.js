import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // The user who made the request
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      // The type of notification
      type: String,
      enum: ["ROLE_REQUEST"],
      required: true,
    },
    content: {
      // A description of the request
      type: String,
      required: true,
    },
    targetRole: {
      // The role the user is requesting
      type: String,
      enum: ["shop-owner", "delivery-staff"],
      required: true,
    },
    licenseImage: {
      type: String,
      required: [true, "A license image is required for partner requests."],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
