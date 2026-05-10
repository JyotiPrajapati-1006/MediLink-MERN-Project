import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { FaUser, FaStore, FaMoneyCheckAlt, FaRupeeSign, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';

const AdminPayoutsPage = () => {
  const { data: payoutsData, loading, error, request: fetchPayouts } = useApi(adminService.getPayoutsData);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleClearPayout = async (shopId, amount) => {
    if (amount <= 0) {
      toast.error('No pending payout to clear.');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${formatCurrency(amount)} as paid for this shop?`)) {
      return;
    }

    const promise = adminService.clearShopPayout(shopId);
    toast.promise(promise, {
      loading: 'Clearing payout...',
      success: (data) => {
        fetchPayouts(); // Refresh data
        return data.message || 'Payout cleared successfully';
      },
      error: 'Failed to clear payout',
    });
  };

  const handleClearDeliveryPayout = async (staffId, amount) => {
    if (amount <= 0) {
      toast.error('No pending payout to clear.');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${formatCurrency(amount)} as paid for this delivery staff?`)) {
      return;
    }

    const promise = adminService.clearDeliveryPayout(staffId);
    toast.promise(promise, {
      loading: 'Clearing payout...',
      success: (data) => {
        fetchPayouts(); // Refresh data
        return data.message || 'Payout cleared successfully';
      },
      error: 'Failed to clear payout',
    });
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-400">Error loading payouts: {error}</p>;

  const shopPayouts = payoutsData?.data?.shopPayouts || [];
  const deliveryPayouts = payoutsData?.data?.deliveryPayouts || [];

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Partner Payouts Management</h1>
      <p className="text-text-secondary mb-8">View total revenues, commissions, and final payout amounts due to your shop owners and delivery staff. Wire transfer the final amounts using the provided bank details.</p>

      {/* --- Shop Owners Payouts Section --- */}
      <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
        <FaStore className="mr-2 text-primary" /> Shop Owner Payouts
      </h2>
      <div className="bg-secondary-dark rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary-dark/30 text-xs text-text-secondary uppercase border-b border-gray-700">
              <tr>
                <th className="px-5 py-4 font-semibold">Shop / Owner</th>
                <th className="px-5 py-4 font-semibold text-center">Completed Orders</th>
                <th className="px-5 py-4 font-semibold text-right">Items Revenue</th>
                <th className="px-5 py-4 font-semibold text-right text-red-400">Admin Cut (30%)</th>
                <th className="px-5 py-4 font-semibold text-right text-green-400">Total Shop Payout</th>
                <th className="px-5 py-4 font-semibold text-right text-yellow-400">Pending Payout</th>
                <th className="px-5 py-4 font-semibold">Bank Details</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shopPayouts.length > 0 ? shopPayouts.map(shop => (
                <tr key={shop.shopId} className="border-b border-gray-700 hover:bg-primary-dark/20 text-text-primary">
                  <td className="px-5 py-4">
                    <p className="font-bold text-primary">{shop.shopName}</p>
                    <p className="text-xs text-text-secondary">Owner: {shop.ownerName}</p>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">{shop.totalOrders}</td>
                  <td className="px-5 py-4 text-right font-medium">{formatCurrency(shop.totalItemsPrice)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-red-400">-{formatCurrency(shop.totalAdminCommission)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="bg-green-500/10 text-green-500 font-bold px-3 py-1 rounded-full lg:text-base">
                      {formatCurrency(shop.totalShopPayout)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="bg-yellow-500/10 text-yellow-500 font-bold px-3 py-1 rounded-full lg:text-base">
                      {formatCurrency(shop.pendingShopPayout || 0)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {shop.bankDetails?.accountNumber ? (
                      <div className="text-xs space-y-1">
                        <p><span className="text-text-secondary">Name:</span> {shop.bankDetails.accountName}</p>
                        <p><span className="text-text-secondary">A/C:</span> <span className="font-mono bg-black/30 px-1 rounded">{shop.bankDetails.accountNumber}</span></p>
                        <p><span className="text-text-secondary">IFSC:</span> {shop.bankDetails.ifscCode}</p>
                        <p><span className="text-text-secondary">Bank:</span> {shop.bankDetails.bankName}</p>
                      </div>
                    ) : (
                      <span className="text-red-400 text-xs italic flex items-center bg-red-500/10 px-2 py-1 rounded w-max">
                        <FaInfoCircle className="mr-1" /> No Bank Found
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Button
                      variant="primary"
                      onClick={() => handleClearPayout(shop.shopId, shop.pendingShopPayout)}
                      disabled={!shop.pendingShopPayout || shop.pendingShopPayout <= 0}
                      className="!py-1 !px-3 !text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <FaCheckCircle /> Mark Paid
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center py-6 text-text-secondary">No shop payouts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Delivery Boys Payouts Section --- */}
      <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center mt-12">
        <FaUser className="mr-2 text-indigo-400" /> Delivery Staff Payouts
      </h2>
      <div className="bg-secondary-dark rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary-dark/30 text-xs text-text-secondary uppercase border-b border-gray-700">
              <tr>
                <th className="px-5 py-4 font-semibold">Delivery Staff</th>
                <th className="px-5 py-4 font-semibold text-center">Total Deliveries</th>
                <th className="px-5 py-4 font-semibold text-right text-green-400">Final Staff Payout</th>
                <th className="px-5 py-4 font-semibold text-right text-yellow-400">Pending Payout</th>
                <th className="px-5 py-4 font-semibold">Bank Details</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryPayouts.length > 0 ? deliveryPayouts.map(staff => (
                <tr key={staff.staffId} className="border-b border-gray-700 hover:bg-primary-dark/20 text-text-primary">
                  <td className="px-5 py-4 font-bold text-indigo-300">{staff.staffName}</td>
                  <td className="px-5 py-4 text-center font-semibold">{staff.totalDeliveries}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="bg-green-500/10 text-green-500 font-bold px-3 py-1 rounded-full text-base">
                      {formatCurrency(staff.totalDeliveryPayout)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="bg-yellow-500/10 text-yellow-500 font-bold px-3 py-1 rounded-full lg:text-base">
                      {formatCurrency(staff.pendingDeliveryPayout || 0)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {staff.bankDetails?.accountNumber ? (
                      <div className="text-xs space-y-1">
                        <p><span className="text-text-secondary">Name:</span> {staff.bankDetails.accountName}</p>
                        <p><span className="text-text-secondary">A/C:</span> <span className="font-mono bg-black/30 px-1 rounded">{staff.bankDetails.accountNumber}</span></p>
                        <p><span className="text-text-secondary">IFSC:</span> {staff.bankDetails.ifscCode}</p>
                        <p><span className="text-text-secondary">Bank:</span> {staff.bankDetails.bankName}</p>
                      </div>
                    ) : (
                      <span className="text-red-400 text-xs italic flex items-center bg-red-500/10 px-2 py-1 rounded w-max">
                        <FaInfoCircle className="mr-1" /> No Bank Found
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Button
                      variant="primary"
                      onClick={() => handleClearDeliveryPayout(staff.staffId, staff.pendingDeliveryPayout)}
                      disabled={!staff.pendingDeliveryPayout || staff.pendingDeliveryPayout <= 0}
                      className="!py-1 !px-3 !text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <FaCheckCircle /> Mark Paid
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-6 text-text-secondary">No delivery payouts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayoutsPage;
