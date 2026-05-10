import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import prescriptionService from '../../api/prescriptionService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/formatDate';
import { FaEye } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-secondary-dark p-4 rounded-lg shadow-xl w-full max-w-lg border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Helper to get color for status badge ---
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500/20 text-yellow-300';
    case 'Approved': return 'bg-green-500/20 text-green-300';
    case 'Rejected': return 'bg-red-500/20 text-red-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

// --- Sub-component for a single prescription card ---
const PrescriptionCard = ({ prescription, onViewImage }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="bg-secondary-dark p-4 rounded-lg border border-gray-700/50 flex flex-col"
  >
    <div className="relative group">
      <img
        src={prescription.imageUrl}
        alt="Prescription Thumbnail"
        className="w-full h-48 rounded-md object-cover bg-primary-dark/30"
      />
      <div
        onClick={() => onViewImage(prescription.imageUrl)}
        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <FaEye className="text-white text-3xl" />
      </div>
    </div>
    <div className="mt-4 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-secondary">Order ID: <span className="font-mono text-primary">#{prescription.order?._id.slice(-6).toUpperCase()}</span></p>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
            {prescription.status}
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">Uploaded: {formatDate(prescription.createdAt)}</p>
      </div>
      {prescription.status === 'Rejected' && (
        <p className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-md">
          <strong>Reason:</strong> {prescription.remarks || 'No reason provided.'}
        </p>
      )}
      <Link to={`/orders/${prescription.order?._id}`} className="w-full mt-4">
        <Button variant="secondary" className="w-full !text-xs !py-1.5">View Order</Button>
      </Link>
    </div>
  </motion.div>
);

const MyPrescriptionsPage = () => {
  const { data: prescriptionsData, loading, error, request: fetchPrescriptions } = useApi(prescriptionService.getMyPrescriptions);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filteredPrescriptions = useMemo(() => {
    if (!prescriptionsData?.data) return [];
    if (!filter) return prescriptionsData.data;
    return prescriptionsData.data.filter(p => p.status === filter);
  }, [prescriptionsData, filter]);

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-text-primary">My Prescriptions</h1>
        <div className="flex space-x-2 p-1 bg-secondary-dark rounded-lg">
          <Button onClick={() => setFilter('')} variant={filter === '' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-white !text-sm">All</Button>
          <Button onClick={() => setFilter('Pending')} variant={filter === 'Pending' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-white !text-sm">Pending</Button>
          <Button onClick={() => setFilter('Approved')} variant={filter === 'Approved' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-white !text-sm">Approved</Button>
          <Button onClick={() => setFilter('Rejected')} variant={filter === 'Rejected' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-white !text-sm">Rejected</Button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
      {error && <p className="text-red-400 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>}

      {!loading && filteredPrescriptions && (
        filteredPrescriptions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredPrescriptions.map(p => (
                <PrescriptionCard
                  key={p._id}
                  prescription={p}
                  onViewImage={setSelectedImage}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary-dark rounded-lg">
            <p className="text-text-secondary">You have no prescriptions with the selected status.</p>
          </div>
        )
      )}

      {/* Image Viewer Modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        <img src={selectedImage} alt="Full Prescription" className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
      </Modal>
    </div>
  );
};

export default MyPrescriptionsPage;