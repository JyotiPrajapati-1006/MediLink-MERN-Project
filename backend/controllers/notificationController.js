import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendEmail from "../utils/otpemail.js";

//    Create a new role request
export const createRoleRequest = asyncHandler(async (req, res) => {
  
  try{
  const { targetRole } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    res.status(400);
    throw new Error("License image is required.");
  }

  const existingRequest = await Notification.findOne({
    user: userId,
    status: "Pending",
  });
  if (existingRequest) {
    res.status(400);
    throw new Error("You already have a pending request.");
  }

  const content = `User ${req.user.name} has requested to become a ${targetRole}.`;

  await Notification.create({
    user: userId,
    type: "ROLE_REQUEST",
    content,
    targetRole,
    licenseImage: req.file.path, // Save the image URL from Cloudinary
  });

  res.status(201).json({
    success: true,
    message: "Your request has been submitted successfully!",
  });
}catch(e){

  console.log(e);
  res.status(500).json({message:"internal server error"})
  
}
});

//     Get all notifications for admin
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ status: "Pending" }).populate(
    "user",
    "name email"
  );
  res.status(200).json({ success: true, data: notifications });
});

//    Resolve a role request
export const resolveRoleRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const notification = await Notification.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!notification || notification.status !== "Pending") {
    res.status(404);
    throw new Error("Notification not found or already resolved.");
  }

  let loginUrl = "http://localhost:5173/"; // Default
  if (notification.targetRole === "shop-owner") {
    loginUrl = "http://localhost:5173/shop/login";
  } else if (notification.targetRole === "delivery-staff") {
    loginUrl = "http://localhost:5173/delivery/login";
  }

  notification.status = status;
  await notification.save();

  let emailSubject = "";
  let emailMessage = "";

  if (status === "Approved") {
    // If approved, update the user's role in the database
    await User.findByIdAndUpdate(notification.user._id, {
      role: notification.targetRole,
    });

    emailSubject =
      "Congratulations! Your MediLink Partner Request has been Approved";
    emailMessage = `
Dear ${notification.user.name}, <br>

&nbsp;&nbsp;&nbsp; Congratulations! We are pleased to inform you that your request to become a ${notification.targetRole} on MediLink has been approved. <br>

You can now log in to your new dashboard using your registered email and password to you upon login.
<br>
<b>Your Login Credentials:</b>
Email: ${notification.user.email}<br>
<b>Password:</b> (Use the password you created during registration)<br>
<b>Login URL:</b> ${loginUrl}<br><br>

<b>Forgot password?</b>"http://localhost:5173/forgot-password".<br><br>

Thank you for joining our network!<br><br>

Sincerely,<br>
The MediLink Team
`;
  } else {
    emailSubject = "Update on Your MediLink Partner Request";
    emailMessage = `Dear ${notification.user.name},\n\nWe regret to inform you that your request to become a ${notification.targetRole} has been rejected at this time.\n\nIf you believe this is an error, please contact our support team.\n\nThank you,\nThe MediLink Team`;
  }

  // 4. Send the email to the user
  try {
    await sendEmail({
      to: notification.user.email,
      subject: emailSubject,
      message: emailMessage,
    });
  } catch (error) {
    console.error(
      "Email could not be sent for role request resolution:",
      error
    );
    // We don't stop the process if email fails, just log it.
  }

  res.status(200).json({
    success: true,
    message: `Request has been ${status} and the user has been notified.`,
  });
});
