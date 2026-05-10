import React, { useState } from 'react';
import notificationService from '../../api/notificationService';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaStore, FaMotorcycle } from 'react-icons/fa';

const BecomePartnerPage = () => {
  const [role, setRole] = useState('shop-owner');
  const [licenseFile, setLicenseFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licenseFile) return toast.error('Please upload your license file.');

    setLoading(true);
    const formData = new FormData();
    formData.append('targetRole', role);
    formData.append('license', licenseFile);

    try {
      const response = await notificationService.createRoleRequest(formData);
      toast.success(response.message);
      setLicenseFile(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const licenseLabel = role === 'shop-owner' ? 'Upload Pharmacy License' : 'Upload Driving License';

  return (
    <div className="container mx-auto text-center max-w-2xl">
      <Toaster position="top-right" />
      <motion.h1 className="text-4xl font-extrabold text-text-primary mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Become a Partner
      </motion.h1>
      <p className="text-text-secondary mb-8">Join our network to grow your business or earn with us by uploading the required documents.</p>

      <motion.div className="bg-secondary p-8 rounded-lg shadow-lg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <form onSubmit={handleSubmit}>
          <label className="block text-lg font-semibold text-text-primary mb-4">I want to register as a:</label>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div onClick={() => setRole('shop-owner')} className={`p-4 border-2 rounded-lg cursor-pointer ${role === 'shop-owner' ? 'border-primary bg-secondary-dark/10 text-text-primary' : 'border-border-color text-text-primary'}`}>
              <FaStore className="mx-auto text-3xl mb-2" />
              <p className="font-semibold">Pharmacy Owner</p>
            </div>
            <div onClick={() => setRole('delivery-staff')} className={`p-4 border-2 rounded-lg cursor-pointer ${role === 'delivery-staff' ? 'border-primary bg-secondary-dark/10 text-text-primary' : 'border-border-color text-text-primary'}`}>
              <FaMotorcycle className="mx-auto text-3xl mb-2" />
              <p className="font-semibold">Delivery Partner</p>
            </div>
          </div>

          <label className="block text-lg font-semibold text-text-primary mb-4">{licenseLabel}</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer mb-6" />

          {preview && (
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-2">Image Preview:</p>
              <img src={preview} alt="License Preview" className="max-h-40 mx-auto rounded-md border border-border-color" />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full !py-3">
            {loading ? <Spinner size="sm" /> : 'Submit Request for Review'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default BecomePartnerPage;