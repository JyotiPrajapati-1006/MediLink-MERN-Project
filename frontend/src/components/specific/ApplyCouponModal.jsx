import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import couponService from '../../api/couponService';
import Button from '../common/Button';
import Input from '../common/Input';
import { FaTags, FaTimes } from 'react-icons/fa';
import Spinner from '../common/Spinner';

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-lg border border-border-color" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ApplyCouponModal = ({ isOpen, onClose, applyCoupon, shopId }) => {
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shopId) {
      setLoading(true);
      couponService.getCouponsByShopId(shopId)
        .then(res => setAvailableCoupons(res.data))
        .catch(err => console.error("Failed to fetch coupons", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, shopId]);

  const handleApply = async () => {
    const success = await applyCoupon(couponCode);
    if (success) {
      onClose(); // Close modal only on successful application
    }
  };

  const handlePredefinedCoupon = async (code) => {
    setCouponCode(code);
    const success = await applyCoupon(code);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center"><FaTags className="mr-3 text-primary" />Apply Coupon</h2>
        <button onClick={onClose} className="text-white hover:text-primary"><FaTimes /></button>
      </div>
      <div className="flex gap-2 mb-6">
        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter Coupon Code" />
        <Button onClick={handleApply}>Apply</Button>
      </div>

      {/* We can temporarily hide MEDILINK10 hardcoded coupon from here if we want, or leave it as a placeholder. We will fetch coupons dynamically soon. */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Available Coupons</h3>
        {loading ? (
          <div className="flex justify-center"><Spinner size="sm" /></div>
        ) : availableCoupons.length > 0 ? (
          <div className="space-y-3">
            {availableCoupons.map((coupon) => (
              <div key={coupon._id} className="border border-dashed border-green-500 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-green-400">{coupon.code}</p>
                  <p className="text-xs text-text-secondary">Get {coupon.discountPercent}% instant discount on this order. Valid till {new Date(coupon.expiryDate).toLocaleDateString()}.</p>
                </div>
                <Button onClick={() => handlePredefinedCoupon(coupon.code)} className="!text-xs !py-1">Apply</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary mb-4">No coupons are currently available for this shop.</p>
        )}
      </div>
    </Modal>
  );
};

export default ApplyCouponModal;