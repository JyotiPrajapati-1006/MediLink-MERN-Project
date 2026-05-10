// src/pages/customer/OrderHistoryPage.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
// Assuming utils for formatting

// Helper to get color for status badge
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
    case 'Awaiting Prescription Approval':
      return 'text-yellow-700';
    case 'Processing':
      return 'text-blue-700';
    case 'Shipped':
    case 'Assigned to Delivery':
      return 'text-indigo-700';
    case 'Delivered':
    case 'Picked Up':
      return 'text-green-700';
    case 'Cancelled':
    case 'Rejected':
      return ' text-red-700';
    default: return ' text-gray-700';
  }
}

// Sub-component for a single order card
const OrderItemCard = ({ order, index }) => {
  return (
    <motion.div
      className="bg-secondary-dark p-5 rounded-lg border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-700 pb-3 mb-3">
        <div>
          <p className="text-sm text-text-secondary">Order ID</p>
          <p className="font-mono text-text-primary">#{order._id.slice(-12).toUpperCase()}</p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-sm text-text-secondary">Order Placed</p>
          <p className="text-text-primary">{formatDate(order.createdAt)}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-text-secondary">Total Amount</p>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(order.pricing.totalPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary mb-1">Status</p>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </div>
      </div>
      <div className="mt-4 text-right">
        <Link to={`/orders/${order._id}`}>
          <Button variant="secondary" className="!text-sm !py-1.5 hover:text-white">View Details</Button>
        </Link>
      </div>
    </motion.div>
  )
}


const OrderHistoryPage = () => {
  const { orders, loading, error, fetchMyOrders } = useOrders();

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <div>
      <motion.h1
        className="text-4xl font-extrabold text-text-primary mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Orders
      </motion.h1>

      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {error && <p className="text-center text-red-400 bg-red-500/20 p-4 rounded-lg">Error: {error}</p>}

      {!loading && !error && (
        orders.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <OrderItemCard key={order._id} order={order} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            className="text-center bg-secondary-dark p-12 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-text-secondary text-xl">You haven't placed any orders yet.</p>
            <Link to="/shops">
              <Button className="mt-6">Start Shopping</Button>
            </Link>
          </motion.div>
        )
      )}
    </div>
  );
};

export default OrderHistoryPage;