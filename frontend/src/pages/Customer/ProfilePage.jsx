import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import userService from '../../api/userService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
  // We get setUser to keep the global state (like in Header) in sync.
  const { setUser } = useAuth();

  // This hook fetches fresh, up-to-date data directly for this page.
  const { data: profileData, loading, error, request: fetchProfile } = useApi(userService.getMyProfile);

  // Local state for managing form inputs
  const [formState, setFormState] = useState({
    name: '', phone: '',
    bankDetails: {
      accountName: '', accountNumber: '', ifscCode: '', bankName: ''
    }
  });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', postalCode: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch fresh profile data when the page loads
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // When the fresh data arrives from the API, populate the local form state
  useEffect(() => {
    if (profileData?.data) {
      setFormState({
        name: profileData.data.name || '',
        phone: profileData.data.phone || '',
        bankDetails: {
          accountName: profileData.data.bankDetails?.accountName || '',
          accountNumber: profileData.data.bankDetails?.accountNumber || '',
          ifscCode: profileData.data.bankDetails?.ifscCode || '',
          bankName: profileData.data.bankDetails?.bankName || '',
        }
      });
    }
  }, [profileData]);

  const handleProfileChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });
  const handleBankChange = (e) => setFormState({ ...formState, bankDetails: { ...formState.bankDetails, [e.target.name]: e.target.value } });
  const handleAddressChange = (e) => setAddressForm({ ...addressForm, [e.target.name]: e.target.value });

  // --- Action Handlers that update both backend and global state ---

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const promise = userService.updateMyProfile(formState).then(res => {
      setUser(res.data); // Update global state
      fetchProfile(); // Refetch local state for this page
    });
    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile.',
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const promise = editingAddressId
      ? userService.updateMyAddress(editingAddressId, addressForm)
      : userService.addMyAddress(addressForm);

    try {
      const response = await toast.promise(promise, {
        loading: `${editingAddressId ? 'Updating' : 'Adding'} address...`,
        success: `Address ${editingAddressId ? 'updated' : 'added'} successfully!`,
        error: (err) => err.response?.data?.message || 'Operation failed.',
      });
      setUser(response.data); // Update global state
      setIsAddressFormVisible(false);
      setEditingAddressId(null);
      setAddressForm({ street: '', city: '', state: '', postalCode: '' });
      fetchProfile();
    } catch (error) { /* Handled by toast */ }
    finally { setIsSubmitting(false); }
  };

  const handleEditClick = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({ street: address.street, city: address.city, state: address.state, postalCode: address.postalCode });
    setIsAddressFormVisible(true);
  };

  const handleDeleteClick = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const promise = userService.deleteMyAddress(addressId).then(res => { setUser(res.data); fetchProfile(); });
      toast.promise(promise, {
        loading: 'Deleting address...',
        success: 'Address deleted successfully!',
        error: 'Failed to delete address.',
      });
    }
  };

  if (loading || !profileData?.data) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  if (error) return <p className="text-red-400">Error: {error}</p>;

  const user = profileData.data; // Use the locally fetched user data for rendering

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <motion.h1 className="text-4xl font-extrabold text-text-primary mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>My Profile</motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information Card */}
        <motion.div className="bg-secondary-dark p-6 rounded-xl shadow-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-2xl font-bold text-primary mb-4">Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input label="Email Address" id="email" value={user.email} disabled />
            <Input label="Full Name" id="name" name="name" value={formState.name} onChange={handleProfileChange} icon={<FaUser className="w-5 h-5 text-gray-400" />} />
            <Input label="Phone Number" id="phone" name="phone" value={formState.phone} onChange={handleProfileChange} icon={<FaPhone className="w-5 h-5 text-gray-400" />} />

            {(user.role === 'shop-owner' || user.role === 'delivery-staff') && (
              <div className="pt-4 mt-6 border-t border-gray-700">
                <h3 className="text-xl font-bold text-primary mb-4">Payout Bank Details</h3>
                <div className="space-y-4">
                  <Input label="Account Name" name="accountName" placeholder="Name as per bank" value={formState.bankDetails.accountName} onChange={handleBankChange} />
                  <Input label="Account Number" name="accountNumber" type="password" placeholder="Account Number" value={formState.bankDetails.accountNumber} onChange={handleBankChange} />
                  <div className="flex space-x-4">
                    <Input label="IFSC Code" name="ifscCode" placeholder="IFSC Code" value={formState.bankDetails.ifscCode} onChange={handleBankChange} />
                    <Input label="Bank Name" name="bankName" placeholder="Bank Name" value={formState.bankDetails.bankName} onChange={handleBankChange} />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit">Save Changes</Button>
          </form>
        </motion.div>

        {/* Address Management Card */}
        <motion.div className="bg-secondary-dark p-6 rounded-xl shadow-lg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">My Addresses</h2>
            {!isAddressFormVisible && (
              <Button variant="secondary" className='flex items-center bg-gray-700 text-text-primary hover:text-white' onClick={() => { setIsAddressFormVisible(true); setEditingAddressId(null); setAddressForm({ street: '', city: '', state: '', postalCode: '' }); }}>
                <FaPlus className="mr-2" /> Add New
              </Button>
            )}
          </div>
          <AnimatePresence>
            {isAddressFormVisible && (
              <motion.form onSubmit={handleAddressSubmit} className="space-y-4 mb-6 border-b border-gray-700 pb-6" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <h3 className="text-lg font-semibold text-text-primary">{editingAddressId ? 'Edit Address' : 'Add a New Address'}</h3>
                <Input id="street" name="street" placeholder="Street Address" value={addressForm.street} onChange={handleAddressChange} />
                <div className="flex space-x-4">
                  <Input id="city" name="city" placeholder="City" value={addressForm.city} onChange={handleAddressChange} />
                  <Input id="state" name="state" placeholder="State" value={addressForm.state} onChange={handleAddressChange} />
                </div>
                <Input id="postalCode" name="postalCode" placeholder="Postal Code" value={addressForm.postalCode} onChange={handleAddressChange} />
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Address'}</Button>
                  <Button type="button" variant="secondary" className='bg-gray-700 text-text-primary hover:text-white' onClick={() => setIsAddressFormVisible(false)}>Cancel</Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <div className="space-y-4">
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div key={addr._id} className="bg-primary-dark border border-gray-700 p-4 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-primary">{addr.street}, {addr.city}</p>
                    <p className="text-sm text-text-secondary">{addr.state} - {addr.postalCode}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => handleEditClick(addr)} className="text-text-secondary hover:text-primary transition-colors"><FaEdit /></button>
                    <button onClick={() => handleDeleteClick(addr._id)} className="text-text-secondary hover:text-red-500 transition-colors"><FaTrash /></button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary text-center py-4">You have no saved addresses.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;