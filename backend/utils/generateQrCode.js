// utils/generateQrCode.js

import QRCode from "qrcode";

/**
 * Generates a QR code from a given string of data.
 * @param {string} data - The data to encode into the QR code (e.g., order ID, URL).
 * @returns {Promise<string>} A promise that resolves to the QR code as a Data URL.
 */
const generateQRCode = async (data) => {
  try {
    // Generate QR code and return it as a base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (err) {
    console.error("Error generating QR code:", err);
    // Throw error to be handled by the calling function (controller)
    throw new Error("Could not generate QR code due to a server error.");
  }
};

export default generateQRCode;
