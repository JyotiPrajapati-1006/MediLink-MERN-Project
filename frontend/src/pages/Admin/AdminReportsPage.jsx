import React, { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminReports({
        startDate,
        endDate,
        reportType: activeTab,
      });
      setReportData(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Admin Reports & Analytics</h1>
        <Button onClick={handlePrint} className="print:hidden">Print Report</Button>
      </div>

      <div className="flex space-x-4 border-b border-gray-700 pb-4 mb-6 print:hidden">
        <Button 
          variant={activeTab === 'sales' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('sales')}
        >
          Sales Report
        </Button>
        <Button 
          variant={activeTab === 'stock' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('stock')}
        >
          Product Stock Report
        </Button>
      </div>

      {activeTab === 'sales' && (
        <div className="mb-6 flex items-end space-x-4 print:hidden">
          <div>
            <label className="block text-sm text-text-secondary mb-1">From Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-secondary border border-gray-600 rounded text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">To Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-secondary border border-gray-600 rounded text-text-primary"
            />
          </div>
          <Button onClick={fetchReport} disabled={loading}>Generate Filtered Report</Button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : reportData ? (
        <div className="print:text-black">
          {activeTab === 'sales' && reportData.summary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-primary/20 border border-primary p-6 rounded-lg text-center">
                  <p className="text-sm text-primary mb-2 font-semibold uppercase">Total Orders</p>
                  <p className="text-3xl font-bold text-text-primary">{reportData.summary.totalOrders}</p>
                </div>
                <div className="bg-green-500/20 border border-green-500 p-6 rounded-lg text-center">
                  <p className="text-sm text-green-400 mb-2 font-semibold uppercase">Total Revenue (₹)</p>
                  <p className="text-3xl font-bold text-text-primary">₹{reportData.summary.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500 p-6 rounded-lg text-center">
                  <p className="text-sm text-blue-400 mb-2 font-semibold uppercase">Admin Commission (₹)</p>
                  <p className="text-3xl font-bold text-text-primary">₹{reportData.summary.totalAdminCommission.toFixed(2)}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-text-primary mb-4">Detailed Sales History</h2>
              <div className="overflow-x-auto print:overflow-visible bg-white dark:bg-secondary-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <table className="min-w-full print:w-full print:text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-text-secondary text-sm">
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Order ID</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Date</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Shop Name</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Subtotal</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Admin Cut</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Total Bill</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary text-sm">
                    {reportData.orders.map(order => (
                      <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                        <td className="px-5 py-4 text-text-secondary font-mono">{order._id.substring(18, 24).toUpperCase()}</td>
                        <td className="px-5 py-4">{format(new Date(order.createdAt), 'dd MMM yyyy')}</td>
                        <td className="px-5 py-4 font-medium">{order.shop?.name || 'N/A'}</td>
                        <td className="px-5 py-4 text-blue-500 dark:text-blue-400 font-medium">₹{order.pricing?.itemsPrice?.toFixed(2)}</td>
                        <td className="px-5 py-4 font-bold text-green-600 dark:text-green-400">₹{order.pricing?.adminCommission?.toFixed(2)}</td>
                        <td className="px-5 py-4 font-bold text-text-primary">₹{order.pricing?.totalPrice?.toFixed(2)}</td>
                      </tr>
                    ))}
                    {reportData.orders.length === 0 && (
                      <tr><td colSpan="6" className="text-center py-8 text-text-secondary">No sales data found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'stock' && reportData.products && (
            <>
              <div className="mb-4">
                <p className="text-text-secondary text-lg">Total Products Listed: <strong className="text-primary">{reportData.totalProducts}</strong></p>
              </div>
              <div className="overflow-x-auto print:overflow-visible bg-white dark:bg-secondary-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <table className="min-w-full print:w-full print:text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-text-secondary text-sm">
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Product Name</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Shop Name</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Category</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Price (₹)</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Stock Qty</th>
                      <th className="px-5 py-4 text-left font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary text-sm">
                    {reportData.products.map(product => {
                      // Accurate total stock including variants
                      let totalStock = product.countInStock || 0;
                      let priceDisplay = `₹${product.price || 0}`;

                      if (product.variants && product.variants.length > 0) {
                        totalStock = product.variants.reduce((acc, v) => acc + (v.countInStock || 0), 0);
                        const prices = product.variants.map(v => v.price);
                        if (prices.length > 0) {
                          priceDisplay = Math.min(...prices) === Math.max(...prices) ? `₹${prices[0]}` : `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`;
                        }
                      }
                      const displayStock = Math.max(0, totalStock);
                      const isOutOfStock = displayStock === 0;
                      const isLowStock = displayStock > 0 && displayStock <= 5;
                      return (
                        <tr key={product._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                          <td className="px-5 py-4 font-medium">{product.name}</td>
                          <td className="px-5 py-4 text-text-secondary">{product.shop?.name || 'N/A'}</td>
                          <td className="px-5 py-4 text-text-secondary text-xs truncate max-w-xs">{product.category && product.category.name ? product.category.name : product.category || 'N/A'}</td>
                          <td className="px-5 py-4 font-medium text-primary whitespace-nowrap">{priceDisplay}</td>
                          <td className={`px-5 py-4 font-bold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-600 dark:text-yellow-500' : 'text-green-600 dark:text-green-500'}`}>
                            {displayStock}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                              isOutOfStock ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 
                              isLowStock ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400' : 
                              'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            }`}>
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AdminReportsPage;
