import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import ReviewModal from '../../components/specific/ReviewModal';
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaFileMedical, FaFilePdf, FaStore } from 'react-icons/fa';
import paymentService from '../../api/paymentService';

// Helper to get theme-appropriate color and text for status
const getStatusInfo = (status) => {
  switch (status) {
    case 'Pending': return { text: 'Pending Payment', color: 'bg-yellow-500/20 text-yellow-300' };
    case 'Awaiting Prescription Approval': return { text: 'Awaiting Approval', color: 'bg-yellow-500/20 text-yellow-300' };
    case 'Processing': return { text: 'Processing', color: 'bg-blue-500/20 text-blue-300' };
    case 'Shipped': return { text: 'Shipped', color: 'bg-purple-500/20 text-purple-300' };
    case 'Ready for Pickup': return { text: 'Ready for Pickup', color: 'bg-teal-500/20 text-teal-300' };
    case 'Out for Delivery': return { text: 'Out for Delivery', color: 'bg-indigo-500/20 text-indigo-300' };
    case 'Picked Up': return { text: 'Picked Up (Completed)', color: 'bg-emerald-500/20 text-emerald-300' };
    case 'Delivered': return { text: 'Delivered', color: 'bg-green-500/20 text-green-300' };
    case 'Cancelled': case 'Rejected': return { text: 'Cancelled', color: 'bg-red-500/20 text-red-300' };
    default: return { text: status, color: 'bg-gray-500/20 text-gray-300' };
  }
};

// --- Order Status Tracker Component ---
const OrderTracker = ({ status, type }) => {
  const isPickup = type === 'Pickup Reservation';

  const steps = isPickup ? [
    { name: 'Processing', icon: <FaBox /> },
    { name: 'Ready for Pickup', icon: <FaStore /> },
    { name: 'Picked Up', icon: <FaCheckCircle /> }
  ] : [
    { name: 'Processing', icon: <FaBox /> },
    { name: 'Shipped', icon: <FaTruck /> },
    { name: 'Out for Delivery', icon: <FaTruck /> },
    { name: 'Delivered', icon: <FaHome /> }
  ];

  // Find the index of the current status
  let currentStepIndex = steps.findIndex(step => step.name === status);

  // If status is 'Pending' or 'Awaiting Approval', no step is active yet
  if (currentStepIndex === -1 && (status === 'Pending' || status === 'Awaiting Prescription Approval')) {
    currentStepIndex = -1;
  }
  // If status is 'Delivered' or further (or Picked Up), all steps are active
  else if (currentStepIndex === -1) {
    currentStepIndex = isPickup ? 2 : 3; // Mark all as complete
  }

  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
      {steps.map((step, index) => (
        <React.Fragment key={step.name}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400'}`}>
              {step.icon}
            </div>
            <p className={`text-xs mt-2 ${index <= currentStepIndex ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>{step.name}</p>
          </div>
          {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-700'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};


const OrderDetailsPage = () => {
  const { id: orderId } = useParams();
  const { order, loading, error, fetchOrderById } = useOrders();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const razorpayOrder = await paymentService.createRazorpayOrder({ amount: order.pricing.totalPrice, currency: 'INR', receipt: order._id });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          const verificationData = { ...response, order_id: order._id };
          const promise = paymentService.verifyPayment(verificationData);
          toast.promise(promise, {
            loading: 'Verifying payment...',
            success: () => {
              fetchOrderById(order._id);
              return 'Payment Successful!';
            },
            error: 'Payment verification failed.',
          });
        },
        prefill: { name: order.user?.name, email: order.user?.email, contact: order.user?.phone },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setPaymentLoading(false) }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  const handleModalClose = (submitted) => {
    setIsReviewModalOpen(false);
    if (submitted) {
      setHasReviewed(true);
    }
  };

  const generateInvoice = () => {
    window.print();
  };

  if (loading || !order) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  const statusInfo = getStatusInfo(order.orderStatus);
  const canReview = ['Delivered', 'Picked Up'].includes(order.orderStatus) && !hasReviewed;
  const pricing = order.pricing; // Get the full pricing object

  console.log(order)
  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary dark:bg-secondary-dark text-text-primary border border-border-color' }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary">Order Details</h1>
            <p className="text-sm font-mono text-text-secondary mt-1">ID: {order._id}</p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0 flex flex-col md:items-end">
            <p className="text-sm text-text-secondary">Order Placed: {formatDate(order.createdAt)}</p>
            <span className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color} w-max`}>{statusInfo.text}</span>
            {['Delivered', 'Picked Up'].includes(order.orderStatus) && (
              <Button onClick={generateInvoice} className="mt-3 text-sm flex items-center gap-2 !bg-indigo-600 hover:!bg-indigo-700 w-max print:hidden">
                <FaFilePdf /> Download / Print Invoice
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
          <div className="lg:col-span-2 space-y-6">
            {order.orderStatus !== 'Awaiting Prescription Approval' && order.orderStatus !== 'Pending' && (
              <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-primary mb-4">Order Status</h2>
                <OrderTracker status={order.orderStatus} type={order.orderType} />
              </div>
            )}

            {order.orderStatus === 'Awaiting Prescription Approval' && (
              <div className="bg-secondary p-6 rounded-lg shadow-lg text-center">
                <FaFileMedical className="text-5xl text-yellow-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-yellow-400 mb-2">Awaiting Prescription Approval</h2>
                <p className="text-text-secondary">Your order is on hold. A pharmacist will review your prescription shortly.</p>
              </div>
            )}

            <div className="bg-secondary p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-primary mb-4">Items in your order</h2>
              <div className="space-y-4">
                {order.orderItems.map(item => (
                  <div key={item._id} className="flex items-center gap-4 border-b border-border-color pb-4 last:border-b-0">
                    <img src={item.product?.images?.[0] || 'https://i.imgur.com/gUPd5n5.jpeg'} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <Link to={`/product/${item.product?._id}`} className="font-semibold text-text-primary hover:text-primary">{item.name}</Link>
                      <p className="text-sm text-text-secondary">{formatCurrency(item.price)} x {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-text-primary">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {order.prescription && order.prescription.imageUrl && (
              <div className="bg-secondary p-6 rounded-lg shadow-lg border border-yellow-500/30">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center"><FaFileMedical className="mr-3" /> Uploaded Prescription</h2>
                <div className="bg-primary-dark/20 p-2 rounded-lg p-2 flex justify-center border border-gray-700">
                  <a href={order.prescription.imageUrl} target="_blank" rel="noreferrer" title="Click to view full size">
                    <img src={order.prescription.imageUrl} alt="Prescription Document" className="w-full h-auto max-h-48 object-contain rounded hover:opacity-80 transition-opacity" />
                  </a>
                </div>
                {order.prescription?.remarks && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-black-300 font-semibold mb-1">Pharmacist Remarks:</p>
                    <p className="text-sm text-red-500">{order.prescription.remarks}</p>
                  </div>
                )}
              </div>
            )}
            {order.orderType === 'Pickup Reservation' ? (
              <div className="bg-secondary p-6 rounded-lg shadow-lg border-2 border-primary/50 text-center flex flex-col items-center">
                <h2 className="text-xl font-bold text-primary mb-4 flex justify-center items-center"><FaStore className="mr-2" /> Self-Pickup Verifier</h2>
                <div className="bg-white p-3 rounded-xl inline-block shadow-inner mb-4">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Order_ID:${order._id}&color=000000`} alt="Pickup QR Code" className="w-36 h-36" />
                </div>
                {order.orderStatus === 'Picked Up' ? (
                  <div className="mt-2 p-3 font-bold text-green-500 border border-green-500/50 bg-green-500/10 rounded w-full">ORDER COLLECTED</div>
                ) : (
                  <p className="text-sm text-text-secondary">Please show this QR code at <span className="font-bold text-text-primary block text-lg mt-2">{order.shop?.name}</span> to collect your items.</p>
                )}
              </div>
            ) : (
              <div className="bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-primary mb-4">Shipping Details</h2>
                <div className="text-sm text-text-secondary space-y-1">
                  <p className="font-semibold text-text-primary">{order.user?.name}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                </div>
              </div>
            )}
            <div className="bg-secondary p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-primary mb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex justify-between"><span>Cart Total (MRP)</span><span>{formatCurrency(pricing.mrpTotal || pricing.itemsPrice)}</span></div>
               {/*  <div className="flex justify-between text-green-500"><span>Discount on MRP</span><span>- {formatCurrency(pricing.totalDiscountOnMrp || 0)}</span></div>*/}
                <div className="flex justify-between"><span>Handling Fee</span><span>{formatCurrency(pricing.handlingFee || 0)}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(pricing.platformFee || 0)}</span></div>
                <div className="flex justify-between"><span>Delivery Charges</span><span className={pricing.deliveryFee === 0 ? 'text-green-500' : ''}>{pricing.deliveryFee === 0 ? 'FREE' : formatCurrency(pricing.deliveryFee)}</span></div>
                <div className="flex justify-between"><span>GST/Taxes (12%)</span><span>{formatCurrency(pricing.taxPrice || 0)}</span></div>
                {pricing.couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Coupon Discount</span><span>- {formatCurrency(pricing.couponDiscount)}</span></div>}
                <div className="flex justify-between font-bold text-lg text-text-primary border-t border-border-color pt-4 mt-4">
                  <span>Grand Total:</span><span>{formatCurrency(pricing.totalPrice)}</span>
                </div>
              </div>

              {!order.isPaid && !['Awaiting Prescription Approval', 'Rejected', 'Cancelled'].includes(order.orderStatus) && (
                <Button onClick={handlePayment} disabled={paymentLoading} className="w-full mt-6 !py-3 !text-base shadow-lg">
                  {paymentLoading ? <Spinner size="sm" /> : `Pay Now`}
                </Button>
              )}
            </div>
            {canReview && (
              <div className="mt-6">
                <Button onClick={() => setIsReviewModalOpen(true)} className="w-full">Write a Review for {order.shop?.name}</Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleModalClose}
        orderId={order._id}
        shopName={order.shop?.name}
      />

      {/* Hidden Invoice Template for PDF Generation */}
      {/* Hidden Invoice Template for PDF Generation */}
      <div id="invoice-download-container" className="hidden print:block w-full bg-white text-black py-12 px-8 min-h-screen z-50 absolute top-0 left-0" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-10 border-b-4 border-gray-800 pb-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">MEDILINK</h1>
            <p className="text-2xl font-bold text-gray-700 mt-2 uppercase tracking-widest">Tax Invoice</p>
            <p className="text-sm text-gray-600 mt-4">Order ID: <span className="font-mono font-bold text-gray-900">{order._id}</span></p>
            <p className="text-sm text-gray-600">Date: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Order_ID:${order._id}&color=000000`} alt="QR Code" className="w-28 h-28 border border-gray-300 p-1 bg-white" />
            <p className="text-[10px] text-gray-500 mt-2 font-bold tracking-widest uppercase">Scan to Verify</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex justify-between mb-12">
          <div className="w-1/2 pr-6">
            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-3 border-b-2 border-gray-200 pb-1 inline-block">Sold By</h3>
            <p className="font-bold text-xl text-gray-900">{order.shop?.name}</p>
            {order.shop?.address ? (
              <>
                <p className="text-sm text-gray-700 mt-1">{order.shop.address.street}</p>
                <p className="text-sm text-gray-700">{order.shop.address.city}, {order.shop.address.state} - {order.shop.address.postalCode}</p>
              </>
            ) : (
              <p className="text-sm text-gray-700 mt-1">Address Details Unavailable</p>
            )}
            <p className="text-sm text-gray-900 mt-2 font-semibold">Phone: {order.shop?.phone || 'N/A'}</p>
          </div>
          <div className="w-1/2 pl-6">
            <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-3 border-b-2 border-gray-200 pb-1 inline-block">
              {order.orderType === 'Pickup Reservation' ? 'Billed To (Self-Pickup)' : 'Billed & Delivered To'}
            </h3>
            <p className="font-bold text-xl text-gray-900">{order.user?.name}</p>

            {order.orderType === 'Pickup Reservation' ? (
              <p className="text-sm text-gray-700 mt-1 font-semibold italic">Customer picking up in-store.</p>
            ) : order.shippingAddress ? (
              <>
                <p className="text-sm text-gray-700 mt-1">{order.shippingAddress.street}</p>
                <p className="text-sm text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              </>
            ) : (
              <p className="text-sm text-gray-700 mt-1">Delivery Address Unavailable</p>
            )}
            <p className="text-sm text-gray-900 mt-2 font-semibold">Phone: {order.user?.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-12 text-left border-collapse">
          <thead>
            <tr className="border-y-2 border-gray-800 bg-gray-100">
              <th className="py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wider">Product Description</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wider text-right">Unit Price</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wider text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="py-5 px-4 text-base font-semibold text-gray-900">{item.name}</td>
                <td className="py-5 px-4 text-base text-gray-800 text-right">{formatCurrency(item.price)}</td>
                <td className="py-5 px-4 text-base text-gray-900 text-center font-bold">{item.quantity}</td>
                <td className="py-5 px-4 text-base font-bold text-gray-900 text-right">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end">
          <div className="w-2/3 max-w-sm space-y-3 text-base text-gray-800">
            <div className="flex justify-between"><span>Subtotal (MRP)</span><span className="font-medium">{formatCurrency(pricing.mrpTotal || pricing.itemsPrice)}</span></div>
            {/*<div className="flex justify-between"><span>Discount on MRP</span><span className="font-medium">- {formatCurrency(pricing.totalDiscountOnMrp || 0)}</span></div>*/}
            <div className="flex justify-between"><span>Handling Fee</span><span className="font-medium">{formatCurrency(pricing.handlingFee || 0)}</span></div>
            <div className="flex justify-between"><span>Platform Fee</span><span className="font-medium">{formatCurrency(pricing.platformFee || 0)}</span></div>
            <div className="flex justify-between"><span>Delivery Charges</span><span className="font-medium">{pricing.deliveryFee === 0 ? 'FREE' : formatCurrency(pricing.deliveryFee)}</span></div>
            <div className="flex justify-between pb-3 border-b-2 border-gray-300"><span>GST / Taxes (12%)</span><span className="font-medium">{formatCurrency(pricing.taxPrice || 0)}</span></div>

            {pricing.couponDiscount > 0 && <div className="flex justify-between pt-2"><span>Coupon Savings</span><span className="font-bold">- {formatCurrency(pricing.couponDiscount)}</span></div>}

            <div className="flex justify-between text-3xl font-black text-gray-900 pt-4 border-t-4 border-gray-900 mt-2 pb-2">
              <span>Grand Total</span><span>{formatCurrency(pricing.totalPrice)}</span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                <span>Payment Mode:</span>
                <span className="uppercase font-bold text-gray-900">{order.paymentMethod} {order.isPaid ? '(PAID)' : '(DUE)'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-24 text-center text-sm text-gray-600 border-t-2 border-gray-200 pt-8">
          <p className="font-bold text-gray-800 mb-2 text-lg">Thank you for ordering with MediLink!</p>
          <p>This is a computer-generated tax invoice and does not require a physical signature or stamp.</p>
          <p className="mt-2 text-xs font-mono">Support: support@medilink.com | 1800-456-7890</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;