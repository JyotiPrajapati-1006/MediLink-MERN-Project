import React, { useEffect, useState } from 'react';
import couponService from '../../api/couponService';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const ShopCoupons = () => {
  const { data: couponsData, loading, request: fetchCoupons } = useApi(couponService.getShopCoupons);
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: '', expiryDate: '', isActive: true, image: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    if (couponsData?.data) {
      setCoupons(couponsData.data);
    }
  }, [couponsData]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountPercent || !newCoupon.expiryDate || !newCoupon.image) {
      toast.error('Please fill in all details and upload an image.');
      return;
    }
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('code', newCoupon.code);
      formData.append('discountPercent', newCoupon.discountPercent);
      formData.append('expiryDate', newCoupon.expiryDate);
      formData.append('isActive', newCoupon.isActive);
      formData.append('image', newCoupon.image);

      const resp = await couponService.createCoupon(formData);
      setCoupons([resp.data, ...coupons]);
      toast.success('Coupon created successfully!');
      setIsModalOpen(false);
      setNewCoupon({ code: '', discountPercent: '', expiryDate: '', isActive: true, image: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const resp = await couponService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons(coupons.map(c => c._id === coupon._id ? resp.data : c));
      toast.success(resp.data.isActive ? "Coupon activated" : "Coupon deactivated");
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Shop Coupons</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center"><FaPlus className="mr-2" /> Add Coupon</Button>
      </div>

      <div className="bg-secondary-dark rounded-xl shadow-lg border border-border-color overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary-dark/20 text-text-secondary uppercase">
              <tr>
                <th className="py-4 px-6 font-semibold">Image</th>
                <th className="py-4 px-6 font-semibold">Code</th>
                <th className="py-4 px-6 font-semibold">Discount (%)</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold">Expiry Date</th>
                <th className="py-4 px-6 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? coupons.map(coupon => (
                <tr key={coupon._id} className="border-b border-gray-700 hover:bg-primary-dark/10 transition-colors">
                  <td className="py-4 px-6">
                    {coupon.image && <img src={coupon.image} alt={coupon.code} className="w-16 h-10 object-cover rounded" />}
                  </td>
                  <td className="py-4 px-6 font-bold text-primary">{coupon.code}</td>
                  <td className="py-4 px-6 text-text-primary">{coupon.discountPercent}%</td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleToggleActive(coupon)} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-text-secondary">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDelete(coupon._id)} className="text-text-secondary hover:text-red-500 p-2"><FaTrash /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-text-secondary">No coupons created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-secondary p-8 rounded-xl shadow-2xl w-full max-w-md border border-border-color">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Coupon</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white"><FaTimes size={20} /></button>
              </div>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Coupon Code</label>
                  <Input placeholder="e.g. SUMMER20" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Discount Percentage (%)</label>
                  <Input type="number" min="1" max="100" placeholder="e.g. 15" value={newCoupon.discountPercent} onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Coupon Image</label>
                  <Input type="file" accept="image/*" onChange={(e) => setNewCoupon({ ...newCoupon, image: e.target.files[0] })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Expiry Date</label>
                  <Input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} required />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancel</Button>
                  <Button type="submit" disabled={actionLoading}>{actionLoading ? <Spinner size="sm" /> : 'Create Coupon'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopCoupons;
