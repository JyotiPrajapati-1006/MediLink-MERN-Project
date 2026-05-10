import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaFileMedical } from 'react-icons/fa';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-lg border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Sub-component for a single prescription card ---
const PrescriptionCard = ({ prescription, onApprove, onReject, onViewImage }) => (
  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
    className="bg-secondary-dark p-4 rounded-lg border border-gray-700/50 flex flex-col"
  >
    <div className="relative group">
      <img
        src={prescription.imageUrl}
        alt="Prescription"
        className="w-full h-48 rounded-md object-cover cursor-pointer bg-primary-dark/30"
        onClick={() => onViewImage(prescription.imageUrl)}
      />
      <div onClick={() => onViewImage(prescription.imageUrl)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <FaEye className="text-white text-3xl" />
      </div>
    </div>
    <div className="mt-4 flex-1 flex flex-col justify-between">
      <div>
        <p className="text-xs text-text-secondary">Order ID: <span className="font-mono text-primary">#{prescription.order?._id.slice(-6)}</span></p>
        <p className="text-sm text-text-primary mt-2">By: <span className="font-semibold">{prescription.user.name}</span></p>
        <div className="mt-2 text-xs text-text-secondary border-t border-gray-700 pt-2">
          <p className="font-semibold">Order Items:</p>
          <ul className="list-disc list-inside">
            {prescription.order?.orderItems?.map(item => <li key={item._id}>{item.name} x{item.quantity}</li>)}
          </ul>
        </div>
      </div>
      {prescription.status === 'Pending' && (
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => onApprove(prescription._id)} className="!text-xs !py-1 !px-2 !bg-green-600 hover:!bg-green-700 flex-1">Approve</Button>
          <Button onClick={() => onReject(prescription)} variant="danger" className="!text-xs !py-1 !px-2 flex-1">Reject</Button>
        </div>
      )}
    </div>
  </motion.div>
);

const ManagePrescriptionsPage = () => {
  const [filter, setFilter] = useState('Pending');
  const { data: prescriptionsData, loading, error, request: fetchPrescriptions, setData } = useApi(shopService.getMyShopPrescriptions);

  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [prescriptionToReject, setPrescriptionToReject] = useState(null);

  const memoizedFetch = useCallback(() => {
    const queryParams = filter ? { status: filter } : {};
    fetchPrescriptions(queryParams);
  }, [filter, fetchPrescriptions]);

  useEffect(() => { memoizedFetch(); }, [memoizedFetch]);

  const handleApprove = (id) => {
    const promise = shopService.updatePrescriptionStatus(id, { status: 'Approved' }).then(() => {
      setData(prev => ({ ...prev, data: prev.data.filter(p => p._id !== id) }));
    });
    toast.promise(promise, { loading: 'Approving...', success: 'Prescription Approved! The order is now ready to process.', error: 'Failed to approve.' });
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    const promise = shopService.updatePrescriptionStatus(prescriptionToReject._id, { status: 'Rejected', remarks: rejectionReason }).then(() => {
      setData(prev => ({ ...prev, data: prev.data.filter(p => p._id !== prescriptionToReject._id) }));
    });
    toast.promise(promise, { loading: 'Rejecting...', success: 'Prescription Rejected!', error: 'Failed to reject.' });
    setPrescriptionToReject(null);
    setRejectionReason('');
  };

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Prescriptions</h1>

      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4">
        <Button onClick={() => setFilter('Pending')} variant={filter === 'Pending' ? 'primary' : 'secondary'}>Pending</Button>
        <Button onClick={() => setFilter('Approved')} variant={filter === 'Approved' ? 'primary' : 'secondary'}>Approved</Button>
        <Button onClick={() => setFilter('Rejected')} variant={filter === 'Rejected' ? 'primary' : 'secondary'}>Rejected</Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && prescriptionsData?.data && (
        prescriptionsData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {prescriptionsData.data.map(p => (
                <PrescriptionCard
                  key={p._id}
                  prescription={p}
                  onApprove={handleApprove}
                  onReject={setPrescriptionToReject}
                  onViewImage={setSelectedImage}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary-dark rounded-lg">
            <FaFileMedical className="mx-auto text-5xl text-text-secondary mb-4" />
            <p className="text-text-secondary">No prescriptions found with status: {filter}</p>
          </div>
        )
      )}

      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <img src={selectedImage} alt="Full Prescription" className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
      </Modal>

      <Modal isOpen={!!prescriptionToReject} onClose={() => setPrescriptionToReject(null)}>
        <h2 className="text-xl font-bold text-text-primary mb-4">Reason for Rejection</h2>
        <form onSubmit={handleRejectSubmit}>
          <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Please provide a clear reason for rejection..." required className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary" />
          <div className="flex justify-end space-x-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => setPrescriptionToReject(null)}>Cancel</Button>
            <Button type="submit" variant="danger">Confirm Rejection</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagePrescriptionsPage;