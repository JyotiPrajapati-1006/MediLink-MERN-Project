import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import PickupScannerModal from '../../components/specific/PickupScannerModal';
import { FaQrcode } from 'react-icons/fa';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-lg border border-border-color" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Helper to get color for status badge ---
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': case 'Awaiting Prescription Approval': return ' text-yellow-700';
    case 'Processing': return ' text-blue-700';
    case 'Ready for Pickup': return ' text-purple-700';
    case 'Shipped': case 'Out for Delivery': return ' text-indigo-700';
    case 'Delivered': case 'Picked Up': return ' text-green-700';
    case 'Cancelled': case 'Rejected': return ' text-red-700';
    default: return ' text-gray-700';
  }
};

const ManageOrdersPage = () => {
  const { data: ordersData, loading, error, request: fetchOrders, setData: setOrdersData } = useApi(shopService.getMyShopOrders);
  const [filter, setFilter] = useState('Processing');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const memoizedFetchOrders = useCallback(() => {
    const queryParams = filter ? { status: filter } : {};
    fetchOrders(queryParams);
  }, [filter, fetchOrders]);

  useEffect(() => {
    memoizedFetchOrders();
  }, [memoizedFetchOrders]);

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = (newStatus) => {
    if (!selectedOrder) return;

    // No need to send deliveryStaffId anymore from here
    const promise = shopService.updateOrderStatus(selectedOrder._id, { status: newStatus });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: () => {
        setOrdersData(prev => ({ ...prev, data: prev.data.filter(o => o._id !== selectedOrder._id) }));
        setIsModalOpen(false);
        return `Order status updated to ${newStatus}`;
      },
      error: 'Failed to update status.'
    });
  };

  const handleScanSuccess = async (orderId) => {
    setIsScannerOpen(false);
    if (!orderId) return;

    const promise = shopService.updateOrderStatus(orderId, { status: 'Picked Up' });

    toast.promise(promise, {
      loading: 'Verifying and updating order...',
      success: () => {
        memoizedFetchOrders();
        return `Order ${orderId.slice(-6).toUpperCase()} marked as Picked Up!`;
      },
      error: 'Failed to verify or update order. Make sure it matches your shop.'
    });
  };

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Manage Your Orders</h1>
        <Button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 !bg-blue-600 hover:!bg-blue-700">
          <FaQrcode /> Scan Pickup QR
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border-color pb-4">
        <Button onClick={() => setFilter('Processing')} variant={filter === 'Processing' ? 'primary' : 'secondary'}>Processing</Button>
        <Button onClick={() => setFilter('Ready for Pickup')} variant={filter === 'Ready for Pickup' ? 'primary' : 'secondary'}>Ready for Pickup</Button>
        <Button onClick={() => setFilter('Shipped')} variant={filter === 'Shipped' ? 'primary' : 'secondary'}>Shipped</Button>
        <Button onClick={() => setFilter('Out for Delivery')} variant={filter === 'Out for Delivery' ? 'primary' : 'secondary'}>On The Way</Button>
        <Button onClick={() => setFilter('Delivered')} variant={filter === 'Delivered' ? 'primary' : 'secondary'}>Completed</Button>
        <Button onClick={() => setFilter('')} variant={filter === '' ? 'primary' : 'secondary'}>All Orders</Button>
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && ordersData?.data && (
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="border-b border-border-color">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.data.map((order) => (
                <tr key={order._id} className="hover:bg-background">
                  <td className="px-5 py-4 border-b border-border-color text-sm font-mono text-text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-4 border-b border-border-color text-sm text-text-secondary">{order.user?.name || 'N/A'}</td>
                  <td className="px-5 py-4 border-b border-border-color text-sm text-text-secondary">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4 border-b border-border-color text-sm font-semibold text-text-primary">{formatCurrency(order.pricing.totalPrice)}</td>
                  <td className="px-5 py-4 border-b border-border-color text-sm">
                    <span className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-border-color text-sm">
                    <Button onClick={() => openDetailsModal(order)} variant="secondary" className="!text-xs !py-1 !px-2">View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedOrder && (
          <div>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
              <span className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span>
            </div>
            <p className="font-mono text-white text-sm mb-4">#{selectedOrder._id}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
              <div>
                <h3 className="font-semibold text-white">Customer Details</h3>
                <p>{selectedOrder.user?.name}</p>
                {selectedOrder.shippingAddress ? (
                  <>
                    <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
                    <p>{selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                  </>
                ) : (
                  <p className="text-yellow-500 italic font-semibold mt-1">Self-Pickup in Store</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">Payment Info</h3>
                <p>Method: {selectedOrder.paymentMethod}</p>
                <p>Status: {selectedOrder.isPaid ? 'Paid' : 'Not Paid'}</p>
                <p>Type: <span className="text-indigo-400 font-semibold">{selectedOrder.orderType || 'Home Delivery'}</span></p>
                <p className="font-bold text-lg text-white mt-2">Total: {formatCurrency(selectedOrder.pricing.totalPrice)}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-border-color pt-4">
              <h3 className="font-semibold text-white">Items Ordered</h3>
              <ul className="list-disc list-inside mt-2 text-text-secondary text-sm space-y-1">
                {selectedOrder.orderItems.map(item => (
                  <li key={item.product}> {item.quantity} x {item.name} <span className="text-white">(@ {formatCurrency(item.price)})</span> </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-border-color">
              <h3 className="font-semibold text-white mb-2">Actions</h3>

              <div className="space-y-4">
                {selectedOrder.orderStatus === 'Processing' && (
                  <Button onClick={() => handleStatusUpdate('Ready for Pickup')} className="w-full">
                    Mark as Ready for {selectedOrder.orderType === 'Pickup Reservation' ? 'Pickup' : 'Delivery/Pickup'}
                  </Button>
                )}
                {selectedOrder.orderStatus === 'Ready for Pickup' && selectedOrder.orderType === 'Pickup Reservation' && (
                  <Button onClick={() => handleStatusUpdate('Picked Up')} variant="primary" className="w-full !bg-green-600 hover:!bg-green-700">
                    Mark as Picked Up (Manual Override)
                  </Button>
                )}
                {['Pending', 'Awaiting Prescription Approval'].includes(selectedOrder.orderStatus) && (
                  <p className="text-sm text-yellow-400">Waiting for payment or prescription approval before processing.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <PickupScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default ManageOrdersPage;