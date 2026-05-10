// src/pages/Admin/ManageShopsPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const ManageShopsPage = () => {
  const { data: shopsData, loading, error, request: fetchShops, setData: setShopsData } = useApi(adminService.getAllShops);
  const [filter, setFilter] = useState('Pending'); // Default to showing pending shops
  const [selectedShop, setSelectedShop] = useState(null);

  const memoizedFetchShops = useCallback(() => {
    const queryParams = filter ? { status: filter } : {};
    fetchShops(queryParams);
  }, [filter, fetchShops]);

  useEffect(() => {
    memoizedFetchShops();
  }, [memoizedFetchShops]);

  const handleStatusChange = async (shopId, newStatus) => {
    const action = newStatus === 'Approved' ? adminService.approveShop : adminService.rejectShop;
    const promise = action(shopId);

    toast.promise(promise, {
      loading: `Updating status to ${newStatus}...`,
      success: (response) => {
        setShopsData(prev => ({
          ...prev,
          data: prev.data.map(shop => shop._id === shopId ? response.data : shop)
        }));
        return `Shop ${newStatus.toLowerCase()} successfully!`;
      },
      error: `Failed to update status.`
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return ' text-yellow-700';
      case 'Approved':
        return ' text-green-700';
      case 'Rejected':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Shops</h1>
      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4">
        <Button onClick={() => setFilter('Pending')} variant={filter === 'Pending' ? 'primary' : 'secondary'}>Pending</Button>
        <Button onClick={() => setFilter('Approved')} variant={filter === 'Approved' ? 'primary' : 'secondary'}>Approved</Button>
        <Button onClick={() => setFilter('Rejected')} variant={filter === 'Rejected' ? 'primary' : 'secondary'}>Rejected</Button>
        <Button onClick={() => setFilter('')} variant={filter === '' ? 'primary' : 'secondary'}>All</Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && shopsData?.data && (
        <div className="bg-secondary-dark shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Shop Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Owner</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shopsData.data.map((shop) => (
                <tr key={shop._id} className="hover:bg-primary-dark">
                  <td className="px-5 py-4 border-b border-gray-700 text-sm text-text-primary">{shop.name}</td>
                  <td className="px-5 py-4 border-b border-gray-700 text-sm text-text-secondary">{shop.owner?.name || 'N/A'}</td>
                  <td className="px-5 py-4 border-b border-gray-700 text-sm">
                    <span className={`capitalize relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusColor(shop.status)}`}>
                      {shop.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-700 text-sm">
                    <div className="flex space-x-2">
                      <Button onClick={() => setSelectedShop(shop)} className="!text-xs !py-1 !px-2 bg-blue-600 hover:bg-blue-700">View</Button>
                      {shop.status === 'Pending' && (
                        <>
                          <Button onClick={() => handleStatusChange(shop._id, 'Approved')} className="!text-xs !py-1 !px-2 !bg-green-600 hover:!bg-green-700">Approve</Button>
                          <Button onClick={() => handleStatusChange(shop._id, 'Rejected')} variant="danger" className="!text-xs !py-1 !px-2">Reject</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shop Details Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary-dark rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-700 relative shadow-2xl">
            <button 
              onClick={() => setSelectedShop(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              &#x2715;
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4">{selectedShop.name}</h2>
            
            <div className="space-y-4 text-sm text-text-secondary">
              <div className="grid grid-cols-2 gap-4">
                <div><strong className="text-text-primary">Owner:</strong> {selectedShop.owner?.name || 'N/A'}</div>
                <div><strong className="text-text-primary">Email:</strong> {selectedShop.email}</div>
                <div><strong className="text-text-primary">Phone:</strong> {selectedShop.phone}</div>
                <div><strong className="text-text-primary">Status:</strong> <span className={`capitalize font-semibold ${getStatusColor(selectedShop.status)}`}>{selectedShop.status}</span></div>
                <div className="col-span-2">
                  <strong className="text-text-primary">Description:</strong>
                  <p className="mt-1">{selectedShop.description}</p>
                </div>
                <div className="col-span-2">
                  <strong className="text-text-primary">Address:</strong>
                  <p className="mt-1">{selectedShop.address?.street}, {selectedShop.address?.city}, {selectedShop.address?.state} - {selectedShop.address?.postalCode}</p>
                </div>
                <div><strong className="text-text-primary">Delivery Radius:</strong> {selectedShop.deliveryRadius} km</div>
              </div>

              {selectedShop.images && selectedShop.images.length > 0 && (
                <div className="mt-6">
                  <strong className="text-text-primary block mb-2">Shop Images:</strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedShop.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Shop img ${idx + 1}`} className="w-32 h-32 object-cover rounded shadow border border-gray-600" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end space-x-4 border-t border-gray-700 pt-4">
               {selectedShop.status === 'Pending' && (
                  <>
                    <Button onClick={() => { handleStatusChange(selectedShop._id, 'Approved'); setSelectedShop(null); }} className="!bg-green-600 hover:!bg-green-700">Approve</Button>
                    <Button onClick={() => { handleStatusChange(selectedShop._id, 'Rejected'); setSelectedShop(null); }} variant="danger">Reject</Button>
                  </>
                )}
                <Button onClick={() => setSelectedShop(null)} variant="secondary">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShopsPage;