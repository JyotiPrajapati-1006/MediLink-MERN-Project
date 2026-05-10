// backend/controllers/prescriptionController.js
import asyncHandler from "express-async-handler";
import Prescription from "../models/Prescription.js";


export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user._id })
    .populate("order", "pricing")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ success: true, count: prescriptions.length, data: prescriptions });
});
