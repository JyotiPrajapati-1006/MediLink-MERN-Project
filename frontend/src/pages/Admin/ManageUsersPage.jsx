// src/pages/Admin/ManageUsersPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import adminService from '../../api/adminService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaUserShield, FaUniversity } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; // CHANGE 1: Import useAuth

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ManageUsersPage = () => {
  const { user: loggedInAdmin } = useAuth(); // CHANGE 1: Get the current admin's data
  const { data: usersData, loading, error, request: fetchUsers, setData: setUsersData } = useApi(adminService.getAllUsers);
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const memoizedFetchUsers = useCallback(() => {
    const queryParams = filter ? { role: filter } : {};
    fetchUsers(queryParams);
  }, [filter, fetchUsers]);

  useEffect(() => {
    memoizedFetchUsers();
  }, [memoizedFetchUsers]);

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openBankModal = (user) => {
    setSelectedUser(user);
    setIsBankModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const promise = adminService.updateUser(selectedUser._id, { role: selectedUser.role });

    toast.promise(promise, {
      loading: 'Updating user...',
      success: (response) => {
        const updatedUser = response.data;
        setUsersData(prevData => ({ ...prevData, data: prevData.data.map(u => u._id === updatedUser._id ? updatedUser : u) }));
        setIsEditModalOpen(false);
        return 'User updated successfully!';
      },
      error: (err) => err.response?.data?.message || 'Failed to update user.',
    });
  };

  const handleDeleteUser = () => {
    const promise = adminService.deleteUser(selectedUser._id);

    toast.promise(promise, {
      loading: 'Deleting user...',
      success: () => {
        setUsersData(prevData => ({ ...prevData, data: prevData.data.filter(u => u._id !== selectedUser._id) }));
        setIsDeleteModalOpen(false);
        return 'User deleted successfully!';
      },
      error: (err) => err.response?.data?.message || 'Failed to delete user.',
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-700';
      case 'shop-owner': return ' text-yellow-700';
      case 'delivery-staff': return 'text-indigo-700';
      default: return ' text-green-700';
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Users</h1>
        <div className="flex space-x-2 mb-6">
          <Button onClick={() => setFilter('')} variant={filter === '' ? 'primary' : 'secondary'}>All Users</Button>
          <Button onClick={() => setFilter('customer')} variant={filter === 'customer' ? 'primary' : 'secondary'}>Customers</Button>
          <Button onClick={() => setFilter('delivery-staff')} variant={filter === 'delivery-staff' ? 'primary' : 'secondary'}>Delivery Staff</Button>
          <Button onClick={() => setFilter('shop-owner')} variant={filter === 'shop-owner' ? 'primary' : 'secondary'}>Shop Owners</Button>
        </div>

        {loading && <Spinner />}
        {error && <p className="text-red-400">Error: {error}</p>}

        {!loading && usersData?.data && (
          <motion.div className="bg-secondary-dark shadow-lg rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Bank Details</th>
                </tr>
              </thead>
              <motion.tbody initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                {/* CHANGE 2: Filter out the current admin from the user list before mapping */}
                {usersData.data
                  .filter(user => user._id !== loggedInAdmin._id)
                  .map((user) => (
                    <motion.tr key={user._id} className="odd:bg-primary-dark/30 even:bg-secondary-dark hover:bg-primary-dark" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                      <td className="px-5 py-4 border-b border-gray-700 text-sm text-text-primary">{user.name}</td>
                      <td className="px-5 py-4 border-b border-gray-700 text-sm text-text-primary">{user.email}</td>
                      <td className="px-5 py-4 border-b border-gray-700 text-sm">
                        <span className={`capitalize relative inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs ${getRoleColor(user.role)}`}>
                          {user.role.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-gray-700 text-sm text-text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 border-b border-gray-700 text-sm">
                        <div className="flex space-x-4">
                          {(user.role === 'shop-owner' || user.role === 'delivery-staff') && (
                            <button onClick={() => openBankModal(user)} title="View Bank Details" className="text-text-secondary hover:text-green-500 transition-colors"><FaUniversity size={16} /></button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </motion.tbody>
            </table>
          </motion.div>
        )}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="flex items-center mb-4">
            <FaUserShield className="text-primary text-2xl mr-3" />
            <h2 className="text-xl font-bold text-text-primary">Edit User: {selectedUser?.name}</h2>
          </div>
          <form onSubmit={handleUpdateUser}>
            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">Role</label>
            <select id="role" value={selectedUser?.role || ''} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })} className="w-full px-3 py-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary">
              {/* CHANGE 3: Removed 'admin' and 'delivery-staff' options */}
              <option value="customer">Customer</option>
              <option value="delivery-staff">delivery-staff</option>
              <option value="shop-owner">Shop Owner</option>
            </select>
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <h2 className="text-xl font-bold text-red-500 mb-2">Confirm Deletion</h2>
          <p className="text-text-secondary mb-6">Are you sure you want to delete <strong className="text-text-primary">{selectedUser?.name}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button type="button" variant="danger" onClick={handleDeleteUser}>Yes, Delete</Button>
          </div>
        </Modal>

        <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)}>
          <div className="flex items-center mb-4 border-b border-gray-700 pb-2">
            <FaUniversity className="text-green-500 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-text-primary">Bank Details</h2>
          </div>
          <div className="space-y-4 mb-6 text-text-secondary">
            <p><strong>User:</strong> {selectedUser?.name} (<span className="capitalize">{selectedUser?.role?.replace('-', ' ')}</span>)</p>
            {selectedUser?.bankDetails?.accountNumber ? (
              <div className="bg-primary-dark/30 p-4 rounded-lg border border-gray-700">
                <p><strong>Account Name:</strong> {selectedUser.bankDetails.accountName}</p>
                <p><strong>Account Number:</strong> {selectedUser.bankDetails.accountNumber}</p>
                <p><strong>IFSC Code:</strong> {selectedUser.bankDetails.ifscCode}</p>
                <p><strong>Bank Name:</strong> {selectedUser.bankDetails.bankName}</p>
              </div>
            ) : (
              <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-900/50">
                This user has not entered their bank details yet.
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsBankModalOpen(false)}>Close</Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ManageUsersPage;