import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/formatDate';
import { FaTrash, FaCheck, FaStar, FaCommentDots } from 'react-icons/fa';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Sub-component for a single Review/Complaint Card ---
const ItemCard = ({ item, onUpdate, onDelete, onView }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-secondary-dark p-4 rounded-lg border border-gray-700/50 cursor-pointer hover:border-primary transition-colors"
    onClick={() => onView(item)}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="font-bold text-text-primary">{item.user?.name || 'Anonymous'}</p>
        <p className="text-xs text-text-secondary">{item.user?.email}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.reviewType === 'Review' ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
        {item.reviewType}
      </span>
    </div>
    <p className="text-sm text-text-secondary mt-2 truncate">{item.comment}</p>
    <div className="flex justify-between items-end mt-4 pt-2 border-t border-gray-700">
      <div className="text-xs text-gray-500">{formatDate(item.createdAt)}</div>
      <div className="flex items-center space-x-2">
        {item.reviewType === 'Complaint' && item.complaintStatus === 'Open' && (
          <Button onClick={(e) => { e.stopPropagation(); onUpdate(item._id, 'Resolved'); }} className="!text-xs !py-1 !px-2 !bg-green-600"><FaCheck className="mr-1" /> Mark as Resolved</Button>
        )}
        <Button onClick={(e) => { e.stopPropagation(); onDelete(item); }} variant="danger" className="!text-xs !py-1 !px-2"><FaTrash /></Button>
      </div>
    </div>
  </motion.div>
);

const ManageComplaintsPage = () => {
  const [filter, setFilter] = useState({ reviewType: 'Complaint', complaintStatus: 'Open' });
  const { data: reviewsData, loading, error, request: fetchReviews, setData } = useApi(adminService.getAllReviews);
  const [selectedItem, setSelectedItem] = useState(null);

  const memoizedFetch = useCallback(() => { fetchReviews(filter); }, [filter, fetchReviews]);
  useEffect(() => { memoizedFetch(); }, [memoizedFetch]);

  const handleUpdateStatus = (id, newStatus) => {
    const promise = adminService.updateReview(id, { complaintStatus: newStatus }).then(() => {
      // Optimistically remove from the current "Open" list view
      setData(prev => ({ ...prev, data: prev.data.filter(item => item._id !== id) }));
    });
    toast.promise(promise, { loading: 'Updating status...', success: 'Status Updated!', error: 'Failed to update status.' });
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete this ${item.reviewType}?`)) {
      const promise = adminService.deleteReview(item._id).then(() => {
        setData(prev => ({ ...prev, data: prev.data.filter(i => i._id !== item._id) }));
      });
      toast.promise(promise, { loading: 'Deleting item...', success: 'Item deleted successfully!', error: 'Failed to delete item.' });
    }
  };

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Reviews & Complaints</h1>

      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4">
        <Button onClick={() => setFilter({ reviewType: 'Review' })} variant={filter.reviewType === 'Review' && !filter.complaintStatus ? 'primary' : 'secondary'}>All Reviews</Button>
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}
      {error && <p className="text-red-400 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>}

      {!loading && reviewsData?.data && (
        reviewsData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {reviewsData.data.map((item) => (
                <ItemCard key={item._id} item={item} onUpdate={handleUpdateStatus} onDelete={handleDelete} onView={setSelectedItem} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary-dark rounded-lg">
            <FaCommentDots className="mx-auto text-5xl text-text-secondary mb-4" />
            <p className="text-text-secondary">No items found in this section.</p>
          </div>
        )
      )}

      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-text-primary capitalize">{selectedItem.reviewType} Details</h2>
              {selectedItem.reviewType === 'Review' && selectedItem.rating && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <FaStar /> <span className="font-bold text-lg">{selectedItem.rating}.0</span>
                </div>
              )}
            </div>
            <div className="text-sm bg-primary-dark/50 p-4 rounded-md">
              <p className="font-semibold text-text-primary">User Details</p>
              <p className="text-text-secondary">{selectedItem.user?.name} ({selectedItem.user?.email})</p>
            </div>
            <div className="text-sm bg-primary-dark/50 p-4 rounded-md">
              <p className="font-semibold text-text-primary">Full Comment / Message</p>
              <p className="text-text-secondary whitespace-pre-wrap mt-1">{selectedItem.comment}</p>
            </div>
            {selectedItem.shop && (
              <div className="text-sm bg-primary-dark/50 p-4 rounded-md">
                <p className="font-semibold text-text-primary">Regarding Shop</p>
                <p className="text-text-secondary">{selectedItem.shop.name}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setSelectedItem(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageComplaintsPage;