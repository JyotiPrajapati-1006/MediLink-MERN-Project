import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import reviewService from '../../api/reviewService';
import { FaStar } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ReviewModal = ({ isOpen, onClose, orderId, shopName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please provide a star rating.');
    setLoading(true);

    const promise = reviewService.createShopReview(orderId, { rating, comment });
    try {
      await toast.promise(promise, {
        loading: 'Submitting review...',
        success: 'Thank you for your feedback!',
        error: (err) => err.response?.data?.message || 'Failed to submit review.'
      });
      onClose(true); // Close modal on success and indicate success
    } catch (error) {
      // Handled by toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Write a Review</h2>
      <p className="text-sm text-text-secondary mb-6">Share your experience with <span className="font-semibold text-primary">{shopName}</span></p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">Your Rating*</label>
          <div className="flex space-x-1">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1;
              return (
                <button type="button" key={ratingValue} onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className="cursor-pointer transition-colors"
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#4A5568"}
                    size={30}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Your Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows="4" className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="secondary" onClick={() => onClose(false)}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;