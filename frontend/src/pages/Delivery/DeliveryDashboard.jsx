import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import deliveryService from '../../api/deliveryService';
import { useAuth } from '../../context/AuthContext';
import userService from '../../api/userService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkedAlt, FaCheckCircle, FaClipboardList, FaTruck, FaPhoneAlt, FaBoxOpen, FaRupeeSign } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';
import Input from '../../components/common/Input';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-md border border-border-color" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Task Card Component with full details ---
const TaskCard = ({ order, onAccept, onUpdateStatus, onDeliver, isAvailable = false }) => {
  const shopAddr = `${order.shop.address.street}, ${order.shop.address.city}`;
  const customerAddr = `${order.shippingAddress.street}, ${order.shippingAddress.city}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-secondary p-4 rounded-lg shadow-lg flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-text-primary text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isAvailable ? 'text-green-700' : 'text-indigo-700'}`}>
            {isAvailable ? 'New' : order.orderStatus}
          </span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="bg-background p-3 rounded-md">
            <p className="font-semibold text-text-primary text-xs uppercase">Pickup From:</p>
            <p className="text-text-secondary font-bold">{order.shop.name}</p>
            <p className="text-text-secondary">{shopAddr}</p>
            <div className="flex justify-between items-center mt-1">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(shopAddr)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">View on Map <FaMapMarkedAlt className="inline ml-1" /></a>
              <a href={`tel:${order.shop.phone}`} className="text-primary text-xs hover:underline">Call Shop <FaPhoneAlt className="inline ml-1" /></a>
            </div>
          </div>
          <div className="bg-background p-3 rounded-md">
            <p className="font-semibold text-text-primary text-xs uppercase">Deliver To:</p>
            <p className="text-text-secondary font-bold">{order.user.name}</p>
            <p className="text-text-secondary">{customerAddr}</p>
            <div className="flex justify-between items-center mt-1">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(customerAddr)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">View on Map <FaMapMarkedAlt className="inline ml-1" /></a>
              {order.user.phone && <a href={`tel:${order.user.phone}`} className="text-primary text-xs hover:underline">Call Customer <FaPhoneAlt className="inline ml-1" /></a>}
            </div>
          </div>
          {order.paymentMethod === 'COD' && (
            <div className="bg-background p-3 rounded-md">
              <p className="font-semibold text-text-primary text-xs uppercase flex items-center"><FaRupeeSign className="mr-1" />Payment Details:</p>
              <p className="font-bold text-yellow-400">Collect {formatCurrency(order.pricing.totalPrice)} (COD)</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {isAvailable && (
          <Button onClick={() => onAccept(order._id)} className="w-full !bg-green-600  hover:!bg-green-700">Accept Task</Button>
        )}
        {order.orderStatus === 'Shipped' && (
          <Button onClick={() => onUpdateStatus(order._id, 'Out for Delivery')} className="w-full flex items-center"><FaTruck className="mr-2" /> Pick Up & Start Delivery</Button>
        )}
        {order.orderStatus === 'Out for Delivery' && (
          <Button onClick={() => onDeliver(order)} className="w-full flex items-center !bg-green-600 hover:!bg-green-700"><FaCheckCircle className="mr-2" /> Deliver Order</Button>
        )}
      </div>
    </motion.div>
  );
};


const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');

  const { data: availableTasks, loading: availableLoading, request: fetchAvailable, setData: setAvailable } = useApi(deliveryService.getAvailableTasks);
  const { data: myTasks, loading: myTasksLoading, request: fetchMyTasks, setData: setMyTasks } = useApi(deliveryService.getMyActiveTasks);
  const { data: history, loading: historyLoading, request: fetchHistory } = useApi(deliveryService.getMyDeliveryHistory);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [orderForOtp, setOrderForOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const { user, setUser } = useAuth();
  const { data: profileResp, request: fetchProfile } = useApi(userService.getMyProfile);
  const [bankForm, setBankForm] = useState({ accountName: '', accountNumber: '', ifscCode: '', bankName: '' });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileResp?.data?.bankDetails) {
      setBankForm({
        accountName: profileResp.data.bankDetails.accountName || '',
        accountNumber: profileResp.data.bankDetails.accountNumber || '',
        ifscCode: profileResp.data.bankDetails.ifscCode || '',
        bankName: profileResp.data.bankDetails.bankName || ''
      });
    } else if (user?.bankDetails) {
      setBankForm({
        accountName: user.bankDetails.accountName || '',
        accountNumber: user.bankDetails.accountNumber || '',
        ifscCode: user.bankDetails.ifscCode || '',
        bankName: user.bankDetails.bankName || ''
      });
    }
  }, [user, profileResp]);

  const handleBankChange = (e) => setBankForm({ ...bankForm, [e.target.name]: e.target.value });

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    const promise = userService.updateMyProfile({ bankDetails: bankForm }).then(res => {
      setUser(res.data);
      return res;
    });
    toast.promise(promise, { loading: 'Saving bank details...', success: 'Bank details updated successfully!', error: 'Failed to update bank details.' });
  };

  const memoizedFetch = useCallback(() => {
    if (activeTab === 'available') fetchAvailable();
    else if (activeTab === 'my-tasks') fetchMyTasks();

    // Guarantee that history runs so the global Stats at the top always map correctly
    fetchHistory();
  }, [activeTab, fetchAvailable, fetchMyTasks, fetchHistory]);

  useEffect(() => {
    memoizedFetch();
    let interval;
    if (activeTab === 'available') {
      interval = setInterval(fetchAvailable, 15000);
    }
    return () => clearInterval(interval);
  }, [memoizedFetch, activeTab]);

  const handleAcceptTask = (orderId) => {
    const promise = deliveryService.acceptTask(orderId).then(() => {
      setAvailable(prev => ({ ...prev, data: prev.data.filter(o => o._id !== orderId) }));
    });
    toast.promise(promise, { loading: 'Accepting...', success: 'Task Accepted! Check "My Tasks".', error: 'Task no longer available.' });
  };

  useEffect(() => {
    let timer;
    if (isOtpModalOpen && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpModalOpen, resendCooldown]);

  const handleUpdateStatus = (orderId, newStatus) => {
    const promise = deliveryService.updateDeliveryStatus(orderId, newStatus).then(() => {
      fetchMyTasks(); // Refetch the list to update the button
    });
    toast.promise(promise, { loading: 'Updating...', success: 'Status Updated!', error: 'Update failed.' });
  };

  const handleDeliverClick = async (order) => {
    setOrderForOtp(order);
    setResendCooldown(30);
    try {
      await toast.promise(deliveryService.sendDeliveryOtp(order._id), {
        loading: 'Sending OTP to customer...',
        success: 'OTP Sent! Ask customer for the code.',
        error: 'Failed to send OTP.'
      });
      setIsOtpModalOpen(true);
    } catch (error) {
      // Error is handled by toast
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const promise = deliveryService.sendDeliveryOtp(orderForOtp._id);
    await toast.promise(promise, { loading: 'Resending OTP...', success: 'New OTP sent!', error: 'Failed to resend.' });
    setResendCooldown(30); // Reset timer
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const promise = deliveryService.verifyDeliveryOtp(orderForOtp._id, otp);
      await toast.promise(promise, {
        loading: 'Verifying OTP...',
        success: 'Delivery Confirmed!',
        error: (err) => err.response?.data?.message || 'Invalid OTP!'
      });
      setMyTasks(prev => ({ ...prev, data: prev.data.filter(o => o._id !== orderForOtp._id) }));
      setIsOtpModalOpen(false);
      setOtp('');
    } catch (error) {
      // Error is handled by toast
    } finally {
      setIsVerifying(false);
    }
  };

  const isLoading = activeTab === 'available' ? availableLoading : activeTab === 'my-tasks' ? myTasksLoading : historyLoading;
  const currentData =
    activeTab === 'available' ? availableTasks :
      activeTab === 'my-tasks' ? myTasks :
        history;

  const totalCompleted = history?.data?.length || 0;
  const totalIncome = history?.data?.reduce((sum, order) => sum + (order.pricing?.deliveryPayout || 30), 0) || 0;
  const pendingIncome = history?.data?.reduce((sum, order) => sum + (!order.isDeliveryStaffPaid ? (order.pricing?.deliveryPayout || 30) : 0), 0) || 0;

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Delivery Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex items-center border border-border-color">
          <div className="bg-primary/20 text-primary p-4 rounded-full mr-4"><FaRupeeSign size={24} /></div>
          <div>
            <p className="text-sm text-text-secondary">Total Delivery Income</p>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-text-secondary mt-1">₹30 per completed order</p>
          </div>
        </div>
        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex items-center border border-border-color border-opacity-50 border-yellow-500/50">
          <div className="bg-yellow-500/20 text-yellow-500 p-4 rounded-full mr-4"><FaRupeeSign size={24} /></div>
          <div>
            <p className="text-sm text-yellow-500/80">Pending Payout</p>
            <p className="text-3xl font-bold text-yellow-500">{formatCurrency(pendingIncome)}</p>
            <p className="text-xs text-text-secondary mt-1">Waiting on Admin wire transfer</p>
          </div>
        </div>
        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex items-center border border-border-color">
          <div className="bg-primary/20 text-primary p-4 rounded-full mr-4"><FaCheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-text-secondary">Completed Deliveries</p>
            <p className="text-3xl font-bold text-text-primary">{totalCompleted}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-border-color">
        <button onClick={() => setActiveTab('available')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'available' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Available Tasks</button>
        <button onClick={() => setActiveTab('my-tasks')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'my-tasks' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>My Tasks</button>
        <button onClick={() => setActiveTab('completed')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'completed' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Completed</button>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Spinner /></div>}

      {!isLoading && currentData?.data && (
        currentData.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {currentData.data.map(order => (
                <TaskCard
                  key={order._id}
                  order={order}
                  onAccept={handleAcceptTask}
                  onUpdateStatus={handleUpdateStatus}
                  onDeliver={handleDeliverClick}
                  isAvailable={activeTab === 'available'}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary rounded-lg shadow-lg">
            <FaBoxOpen className="mx-auto text-5xl text-text-secondary mb-4" />
            <p className="text-text-secondary">No tasks found in this section.</p>
          </div>
        )
      )}

      <Modal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-white">Confirm Delivery</h2>
        <p className="text-sm text-text-secondary mb-4">Please ask the customer for the OTP sent to their email to complete the delivery.</p>
        <form onSubmit={handleOtpVerification}>
          <Input id="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" required />
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-text-secondary">
              {resendCooldown > 0 ? (
                <span>Resend OTP in {resendCooldown}s</span>
              ) : (
                <button type="button" onClick={handleResendOtp} className="text-primary hover:underline">
                  Resend OTP
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="secondary" onClick={() => setIsOtpModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isVerifying}>{isVerifying ? <Spinner size="sm" /> : 'Confirm Delivery'}</Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Bank Details Section for Delivery Boy */}
      <div className="mt-12 pt-8 border-t border-border-color">
        <h2 className="text-2xl font-bold text-primary mb-6">Payout Bank Details</h2>
        <form onSubmit={handleBankSubmit} className="space-y-4 bg-secondary p-6 rounded-lg border border-border-color shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Account Name" name="accountName" placeholder="Name as per bank" value={bankForm.accountName} onChange={handleBankChange} required />
            <Input label="Account Number" name="accountNumber" type="password" placeholder="Account Number" value={bankForm.accountNumber} onChange={handleBankChange} required />
            <Input label="IFSC Code" name="ifscCode" placeholder="IFSC Code" value={bankForm.ifscCode} onChange={handleBankChange} required />
            <Input label="Bank Name" name="bankName" placeholder="Bank Name" value={bankForm.bankName} onChange={handleBankChange} required />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit">Save Bank Details</Button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default DeliveryDashboard;