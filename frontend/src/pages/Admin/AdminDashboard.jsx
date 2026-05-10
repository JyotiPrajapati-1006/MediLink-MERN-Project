// src/pages/Admin/AdminDashboard.jsx

import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

// Sub-component for statistic cards
const StatCard = ({ title, value, icon }) => (
  <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex items-center">
    <div className="bg-primary/20 text-primary p-3 rounded-full mr-4">{icon}</div>
    <div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

// Helper to get color for order status badge
const getStatusColor = (status) => {
  // ... [same as in OrderHistoryPage.jsx]
  switch (status) {
    case 'Pending': return 'text-yellow-700';
    case 'Processing': return 'text-blue-700';
    case 'Shipped': return ' text-indigo-700';
    case 'Delivered': return ' text-green-700';
    case 'Cancelled': return 'text-red-700';
    default: return 'text-gray-700';
  }
};

const AdminDashboard = () => {
  const { data: stats, loading: statsLoading, request: fetchStats } = useApi(adminService.getDashboardStats);
  const { data: recentOrders, loading: ordersLoading, request: fetchRecentOrders } = useApi(adminService.getRecentOrders);
  const { data: pendingShops, loading: shopsLoading, request: fetchPendingShops } = useApi(adminService.getPendingShops);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
    fetchPendingShops();
  }, [fetchStats, fetchRecentOrders, fetchPendingShops]);

  const isLoading = statsLoading || ordersLoading || shopsLoading;

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      {isLoading ? <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div> : (
        <div className="space-y-8">
          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={formatCurrency(stats?.data?.totalRevenue || 0)} icon={'💰'} />
            <StatCard title="Admin Commission" value={formatCurrency(stats?.data?.adminCommission || 0)} icon={'🏛️'} />
            <StatCard title="Shop Payouts" value={formatCurrency(stats?.data?.shopPayout || 0)} icon={'🏪'} />
            <StatCard title="Delivery Payouts" value={formatCurrency(stats?.data?.deliveryPayout || 0)} icon={'🚚'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Users" value={stats?.data?.totalUsers || 0} icon={'👤'} />
            <StatCard title="Approved Shops" value={stats?.data?.totalShops || 0} icon={'🏪'} />
            <StatCard title="Total Orders" value={stats?.data?.totalOrders || 0} icon={'🛒'} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders Table */}
            <div className="lg:col-span-2 bg-secondary-dark p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-text-primary mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary  uppercase border-b border-gray-700">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders?.data?.map(order => (
                      <tr key={order._id} className="border-b border-gray-700 hover:bg-primary-dark/30">
                        <td className="py-3 px-4 font-mono text-text-primary">#{order._id.slice(-6)}</td>
                        <td className="py-3 px-4 text-text-secondary">{order.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold text-text-primary">{formatCurrency(order.pricing.totalPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Shops List */}
            <div className="lg:col-span-1 bg-secondary-dark p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-text-primary mb-4">Pending Shop Approvals</h2>
              {pendingShops?.data && pendingShops.count > 0 ? (
                <ul className="space-y-3">
                  {pendingShops.data.map(shop => (
                    <li key={shop._id} className="p-3 bg-primary-dark/50 rounded-md hover:bg-primary-dark">
                      <Link to={`/admin/shops/${shop._id}`} className="flex justify-between items-center text-text-secondary hover:text-primary">
                        <span>{shop.name}</span>
                        <span className="text-xs font-mono">{formatDate(shop.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-text-secondary mb-8">No shops are pending for approval.</p>}

              <h2 className="text-xl font-bold text-text-primary mb-4 border-t border-gray-700 pt-6">Shop-wise Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary uppercase border-b border-gray-700">
                    <tr>
                      <th className="py-2 px-3">Shop</th>
                      <th className="py-2 px-3">Orders</th>
                      <th className="py-2 px-3">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.data?.shopStats?.map(shop => (
                      <tr key={shop._id} className="border-b border-gray-700">
                        <td className="py-2 px-3 text-text-primary font-medium">{shop.shopName}</td>
                        <td className="py-2 px-3 text-text-secondary">{shop.orderCount}</td>
                        <td className="py-2 px-3 font-semibold text-text-primary">{formatCurrency(shop.totalPayout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;