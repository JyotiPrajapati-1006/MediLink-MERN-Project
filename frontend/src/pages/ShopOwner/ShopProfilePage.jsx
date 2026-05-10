import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import shopService from '../../api/shopService';
import userService from '../../api/userService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import { FaImage } from 'react-icons/fa';

const ShopProfilePage = () => {
  // Get shop data, loading state, and refetch function from the global ShopContext
  const { shop, isLoading: isShopLoading, refetchShop } = useShop();

  // API hook specifically for the update operation
  const { loading: isUpdateLoading, request: updateShop } = useApi(shopService.updateMyShop);

  const [formData, setFormData] = useState({
    name: '', description: '', street: '', city: '',
    state: '', postalCode: '', phone: '', email: '',
    deliveryRadius: 0, isActive: true,
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

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

  // When the shop data loads from the context, populate the form
  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        description: shop.description || '',
        street: shop.address?.street || '',
        city: shop.address?.city || '',
        state: shop.address?.state || '',
        postalCode: shop.address?.postalCode || '',
        phone: shop.phone || '',
        email: shop.email || '',
        deliveryRadius: shop.deliveryRadius || 0,
        isActive: shop.isActive,
      });
      setPreviews(shop.images || []);
    }
  }, [shop]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setFiles(selectedFiles);
    previews.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) });
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const shopFormData = new FormData();
    Object.keys(formData).forEach(key => shopFormData.append(key, formData[key]));
    if (files.length > 0) {
      files.forEach(file => shopFormData.append('images', file));
    }

    const promise = updateShop(shopFormData);

    toast.promise(promise, {
      loading: 'Updating shop profile...',
      success: () => {
        refetchShop(); // Refetch data to update the UI everywhere
        return 'Shop profile updated successfully!';
      },
      error: (err) => err.response?.data?.message || 'Failed to update shop.',
    });
  };

  if (isShopLoading) return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  if (!shop) return <p className="text-text-secondary">Shop profile not found. Please create one.</p>;

  return (
    <div className="bg-secondary-dark p-8 rounded-lg shadow-2xl max-w-5xl mx-auto border border-gray-700/50">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Manage Your Shop Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column for Basic Info */}
          <div className="space-y-4">
            <Input name="name" label="Shop Name" value={formData.name} onChange={handleChange} required />
            <Input name="phone" label="Contact Phone" type="tel" value={formData.phone} onChange={handleChange} required />
            <Input name="email" label="Contact Email" type="email" value={formData.email} onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Shop Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className="w-full p-2 bg-secondary-dark border border-gray-600 text-text-primary rounded-md"></textarea>
            </div>
          </div>
          {/* Right Column for Address & Settings */}
          <div className="space-y-4">
            <Input name="street" label="Street Address" value={formData.street} onChange={handleChange} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="city" label="City" value={formData.city} onChange={handleChange} required />
              <Input name="state" label="State" value={formData.state} onChange={handleChange} required />
            </div>
            <Input name="postalCode" label="Postal Code" value={formData.postalCode} onChange={handleChange} required />
            <Input name="deliveryRadius" label="Delivery Radius (km)" type="number" value={formData.deliveryRadius} onChange={handleChange} required />

            <div className="flex items-center justify-between bg-primary-dark/50 p-4 rounded-lg mt-4">
              <label htmlFor="isActive" className="text-text-primary font-medium">Shop Status <span className={`text-xs ml-2 ${formData.isActive ? 'text-green-400' : 'text-red-400'}`}>{formData.isActive ? 'OPEN' : 'CLOSED'}</span></label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                <label htmlFor="isActive" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
              </div>
            </div>
            <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563EB; } .toggle-checkbox:checked + .toggle-label { background-color: #2563EB; }`}</style>
          </div>
        </div>

        {/* Image Management Section */}
        <div className="pt-6 border-t border-gray-700">
          <label className="block text-sm font-medium text-text-primary mb-2">Shop Images (Replace existing by uploading new ones)</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square">
                <img src={src} alt="Shop Preview" className="w-full h-full rounded-md object-cover border-2 border-gray-600" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-700">
          <Button type="submit" disabled={isUpdateLoading}>
            {isUpdateLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Bank Details Section */}
      <div className="pt-8 mt-12 border-t border-gray-700">
        <h2 className="text-2xl font-bold text-primary mb-6">Payout Bank Details</h2>
        <form onSubmit={handleBankSubmit} className="space-y-4 bg-primary-dark/10 p-6 rounded-lg border border-gray-700">
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

export default ShopProfilePage;