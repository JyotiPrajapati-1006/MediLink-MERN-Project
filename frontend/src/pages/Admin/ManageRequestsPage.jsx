import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import notificationService from '../../api/notificationService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>);

const ManageRequestsPage = () => {
  const { data: requests, loading, request: fetchRequests, setData } = useApi(notificationService.getAdminNotifications);
  const [licenseUrl, setLicenseUrl] = useState(null);

  const memoizedFetch = useCallback(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { memoizedFetch(); }, [memoizedFetch]);

  const handleResolve = (id, status) => {
    const promise = notificationService.resolveRoleRequest(id, status).then(() => {
      setData(prev => ({ ...prev, data: prev.data.filter(req => req._id !== id) }));
    });
    toast.promise(promise, { loading: 'Processing...', success: `Request ${status}.`, error: 'Failed.' });
  };

  return (
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Pending Role Requests</h1>
      {loading && <Spinner />}
      {!loading && requests?.data && (
        <div className="space-y-4">
          {requests.data.map(req => (
            <div key={req._id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold text-text-primary">{req.user.name} ({req.user.email})</p>
                <p className="text-sm text-text-secondary">Wants to be a <span className="font-bold text-primary">{req.targetRole}</span></p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setLicenseUrl(req.licenseImage)} variant="secondary" className="!text-xs !py-1">View License</Button>
                <Button onClick={() => handleResolve(req._id, 'Approved')} className="!text-xs !py-1 !bg-green-600">Approve</Button>
                <Button onClick={() => handleResolve(req._id, 'Rejected')} variant="danger" className="!text-xs !py-1">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!licenseUrl} onClose={() => setLicenseUrl(null)}>
        <h2 className="text-xl font-bold mb-4">License Verification</h2>
        <img src={licenseUrl} alt="License" className="w-full rounded-lg" />
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setLicenseUrl(null)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageRequestsPage;