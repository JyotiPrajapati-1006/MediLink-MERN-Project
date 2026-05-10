import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { FaBoxOpen, FaClipboardList, FaRupeeSign, FaPills, FaFileMedical, FaHourglassHalf, FaMoneyBillWave } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon, link }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-secondary-dark p-6 rounded-lg shadow-lg flex items-center"
  >
    <div className="bg-primary/20 text-primary p-4 rounded-full mr-4">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
    {link && (
      <Link to={link} className="text-xs text-primary hover:underline self-end">
        View
      </Link>
    )}
  </motion.div>
);

// --- Helper to get color for order status badge ---
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return ' text-yellow-700';
    case 'Processing': return ' text-blue-700';
    case 'Shipped': return ' text-indigo-700';
    case 'Delivered': return ' text-green-700';
    case 'Cancelled': return ' text-red-700';
    default: return ' text-gray-700';
  }
};

const ShopDashboard = () => {
  // We use the same service, but we will handle the response differently
  const { data: dashboardData, loading, error, request: fetchDashboard } = useApi(shopService.getMyShopDashboard);
  const { data: shopProfileData, request: fetchShopProfile } = useApi(shopService.getMyShop);

  useEffect(() => {
    fetchDashboard();
    fetchShopProfile(); // Fetch shop profile to check its status
  }, [fetchDashboard, fetchShopProfile]);

  const stats = dashboardData?.data;
  const shopStatus = shopProfileData?.data?.status;

  // --- Render Logic ---

  // 1. Initial Loading State
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  // 2. If shop profile is pending approval
  if (shopStatus === 'Pending') {
    return (
      <div className="text-center py-20 bg-secondary-dark rounded-lg flex flex-col items-center">
        <FaHourglassHalf className="text-5xl text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold text-text-primary">Your Shop is Pending Approval</h2>
        <p className="text-text-secondary mt-2 max-w-md">
          Your shop profile has been submitted and is currently under review by the admin. You will be notified once it is approved.
        </p>
      </div>
    );
  }

  if(shopStatus ==='Rejected'){
    return(
      <h2 className='text-[red]'>shoap is rejected by Admin.</h2>
    )
  }

  // 3. If there is an error (other than shop not found, which is handled by sidebar)
  if (error) {
    return <p className="text-red-400 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>;
  }

  // 4. Main Dashboard View
  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Shop Dashboard</h1>

      {stats && (
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Stat Cards Section */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Total Products" value={stats.totalProducts} icon={<FaPills size={22} />} link="/shop-owner/products" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<FaClipboardList size={22} />} link="/shop-owner/orders" />
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<FaRupeeSign size={22} />} />
            <StatCard title="Pending Payout" value={formatCurrency(stats.pendingPayout || 0)} icon={<FaMoneyBillWave size={22} className="text-yellow-400" />} />
            <StatCard title="Pending Prescriptions" value={stats.pendingPrescriptions} icon={<FaFileMedical size={22} />} link="/shop-owner/prescriptions" />
          </motion.div>

          {/* Recent Orders Table */}
          <motion.div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Recent Orders</h2>
              <Link to="/shop-owner/orders" className="text-sm text-primary hover:underline">View All Orders</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary uppercase border-b border-gray-700">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map(order => (
                      <tr key={order._id} className="border-b border-gray-700 last:border-b-0 hover:bg-primary-dark/30">
                        <td className="py-3 px-4 font-mono text-text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 px-4 text-text-secondary">{order.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-text-secondary">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 font-semibold text-text-primary">{formatCurrency(order.pricing.totalPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-text-secondary">No recent orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ShopDashboard;