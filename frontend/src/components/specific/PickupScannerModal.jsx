import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const PickupScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText) => {
        // e.g. decodedText = "Order_ID:671b5...abc"
        if (decodedText.startsWith("Order_ID:")) {
          const orderId = decodedText.split("Order_ID:")[1].trim();
          scanner.clear();
          onScanSuccess(orderId);
        } else if (decodedText.length === 24) { // Direct mongo id fallback
          scanner.clear();
          onScanSuccess(decodedText.trim());
        } else {
          setError('Invalid QR code format. Please scan a valid MediLink pickup code.');
        }
      }, (err) => {
        // Ignored, happens constantly as it scans
      });

      return () => {
        scanner.clear().catch(e => console.error("Scanner clear error", e));
      };
    }
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white p-6 rounded-lg w-full max-w-md relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
            <FaTimes size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 border-b pb-2">Scan Pickup QR Code</h2>
          <div id="reader" className="w-full text-black"></div>
          {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-100 p-2 rounded">{error}</p>}
          <p className="text-center text-gray-500 text-sm mt-4">Ask the customer to open their Order Details page and show the QR code.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PickupScannerModal;
