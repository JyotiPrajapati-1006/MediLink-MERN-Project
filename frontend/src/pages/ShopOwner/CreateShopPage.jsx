// src/pages/ShopOwner/CreateShopPage.jsx

import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';

const CreateShopPage = () => {
  // This function is passed down from the ShopOwnerLayout to refresh the sidebar
  const { refetchShop } = useOutletContext();
  const navigate = useNavigate();

  // State for all form text fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    deliveryRadius: 5,
  });

  // State for file uploads and their previews
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // State for geolocation
  const [coordinates, setCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // State for terms and conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // API hook for the form submission
  const { loading, request: createShop } = useApi(shopService.createMyShop);

  // --- Event Handlers ---

  // Handles changes in all text input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles selection of image files
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5); // Limit to 5 images
    setFiles(selectedFiles);

    // Clean up old preview URLs to prevent memory leaks
    previews.forEach(url => URL.revokeObjectURL(url));

    // Create new preview URLs
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  // Fetches address from coordinates using a free reverse geocoding API
  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const address = response.data.address;
      return {
        street: address.road || '',
        city: address.city || address.town || '',
        state: address.state || '',
        postalCode: address.postcode || '',
      };
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      return null;
    }
  };

  // Handler for the "Use My Current Location" button
  const handleGetLocation = () => {
    setLocationLoading(true);
    toast.loading('Fetching your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);

        const address = await getAddressFromCoords(latitude, longitude);
        toast.dismiss();

        if (address) {
          setFormData(prev => ({ ...prev, ...address }));
          toast.success('Address automatically filled!');
        } else {
          toast.error('Could not convert location to an address.');
        }
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        toast.dismiss();
        toast.error('Unable to retrieve your location. Please grant permission.');
      }
    );
  };

  // Handles the final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return toast.error('Please accept the Terms and Conditions.');
    }
    if (files.length === 0) {
      return toast.error('Please upload at least one shop image.');
    }

    const shopFormData = new FormData();

    // Append all text fields from the state
    Object.keys(formData).forEach(key => {
      shopFormData.append(key, formData[key]);
    });

    // Append coordinates if they were fetched
    if (coordinates) {
      shopFormData.append('coordinates', JSON.stringify(coordinates));
    }

    // Append all image files
    files.forEach(file => {
      shopFormData.append('images', file);
    });

    try {
      await createShop(shopFormData);
      toast.success('Shop profile submitted for approval!');
      refetchShop(); // This tells the sidebar to update itself
      navigate('/shop-owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shop.');
    }
  };

  return (
    <div className="bg-secondary-dark p-8 rounded-lg shadow-2xl max-w-4xl mx-auto border border-gray-700/50">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <h1 className="text-3xl font-bold text-text-primary mb-2">Create Your Shop Profile</h1>
      <p className="text-text-secondary mb-8">Fill in the details to register your pharmacy. Your shop will be visible after admin approval.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Information --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="name" label="Shop Name" value={formData.name} onChange={handleChange} required />
          <Input name="phone" label="Contact Phone" type="tel" value={formData.phone} onChange={handleChange} required />
        </div>
        <Input name="email" label="Contact Email" type="email" value={formData.email} onChange={handleChange} required />

         <Input name="gst" label="GST Number" type="text"  required />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Shop Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
        </div>

        {/* --- Address Details --- */}
        <h2 className="text-xl font-semibold text-primary pt-6 border-t border-gray-700">Address Details</h2>
        <Input name="street" label="Street Address" value={formData.street} onChange={handleChange} required />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input name="city" label="City" value={formData.city} onChange={handleChange} required />
          <Input name="state" label="State" value={formData.state} onChange={handleChange} required />
          <Input name="postalCode" label="Postal Code" value={formData.postalCode} onChange={handleChange} required />
        </div>

        {/* --- Other Details --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Shop Images (Max 5)</label>
            <input type="file" multiple name="images" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer" />
            {previews.length > 0 && (
              <div className="mt-4 flex gap-4 flex-wrap">
                {previews.map((src, index) => (
                  <img key={index} src={src} alt={`Preview ${index}`} className="w-24 h-24 rounded-md object-cover border-2 border-gray-600" />
                ))}
              </div>
            )}
          </div>
          <div>
            <Input name="deliveryRadius" label="Delivery Radius (in km)" type="number" value={formData.deliveryRadius} onChange={handleChange} required />
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">Location</label>
              <Button type="button" variant="secondary" onClick={handleGetLocation} disabled={locationLoading}>{locationLoading ? 'Fetching...' : 'Use My Current Location'}</Button>
              {coordinates && <p className="text-green-400 text-sm mt-2">Location captured!</p>}
            </div>
          </div>
        </div>

        {/* --- Terms and Conditions --- */}
        <div className="flex items-start mt-6 bg-secondary p-4 rounded-lg border border-gray-700">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 text-primary bg-secondary-dark border-gray-600 rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-text-secondary cursor-pointer">
              I have read and agree to the{' '}
              <button type="button" className="text-primary hover:underline" onClick={() => setShowTermsModal(true)}>Terms and Conditions</button>
              {' '}and{' '}
              <button type="button" className="text-primary hover:underline" onClick={() => setShowTermsModal(true)}>Privacy Policy</button>.
            </label>
            <p className="text-gray-500 text-xs mt-1">By checking this box, you confirm that the information provided is accurate and you agree to adhere to our platform guidelines.</p>
          </div>
        </div>

        <Button type="submit" disabled={loading || locationLoading} className="w-full !py-3 !mt-6 !text-base">
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </form>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-secondary-dark rounded-lg max-w-2xl w-full p-6 max-h-[90vh] flex flex-col border border-gray-700 relative shadow-2xl">
            <button 
              onClick={() => setShowTermsModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              &#x2715;
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4 shrink-0">Terms and Conditions</h2>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-4 text-sm text-text-secondary">
              <p>Welcome to MediLink. By registering your shop on our platform, you agree to comply with and be bound by the following terms and conditions:</p>
              
              <h3 className="text-lg font-semibold text-text-primary">1. Platform Commission (30% Cut)</h3>
              <p>MediLink will deduct a flat <strong className="text">30% commission</strong> on the total value of all successful orders placed through the platform. Payouts for the remaining 70% will be processed according to our payout schedule.</p>

              <h3 className="text-lg font-semibold text-text-primary">2. Quality and Authenticity</h3>
              <p>You guarantee that all products and medicines sold are authentic, unexpired, and procured from authorized distributors. Selling counterfeit or expired medicines is strictly prohibited and will result in immediate termination.</p>

              <h3 className="text-lg font-semibold text-text-primary">3. Prescription Verification</h3>
              <p>For prescription-only medicines (Rx), you are solely responsible for thoroughly verifying the validity of the uploaded prescription before dispensing the medication.</p>

              <h3 className="text-lg font-semibold text-text-primary">4. Order Fulfillment and Delivery</h3>
              <p>You agree to prepare orders promptly. If partnering with MediLink delivery drivers, hand over the correct items in secure packaging. You are responsible for any errors in order preparation.</p>

              <h3 className="text-lg font-semibold text-text-primary">5. Admin Approval</h3>
              <p>Your shop profile is subject to approval by the MediLink administration. We reserve the right to reject applications or suspend active shops that violate our policies.</p>

              <h3 className="text-lg font-semibold text-text-primary">6. Privacy and Customer Data</h3>
              <p>You agree to handle all customer data, including medical information and contact details, with strict confidentiality in accordance with our Privacy Policy. You may not use this data for marketing outside the platform.</p>

              <p className="pt-4 border-t border-gray-700 italic">By checking the agreement box on the registration form, you acknowledge that you have read, understood, and agreed to these terms.</p>
            </div>
            
            <div className="mt-6 flex justify-end shrink-0 pt-4 border-t border-gray-700">
               <Button onClick={() => setShowTermsModal(false)} variant="primary">I Understand</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateShopPage;