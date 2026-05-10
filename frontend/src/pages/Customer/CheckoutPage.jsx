import React, { useState, useMemo, useEffect } from 'react';
import { useApi } from '../../hooks/useApi'; // Import useApi
import userService from '../../api/userService'; // Import userService
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import paymentService from '../../api/paymentService';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFileMedical, FaShippingFast, FaPlus, FaShoppingCart, FaTags, FaTimes } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import ApplyCouponModal from '../../components/specific/ApplyCouponModal';

const CheckoutPage = () => {

  const { data: profileData, loading: isUserLoading, request: fetchUser } = useApi(userService.getMyProfile);
  const user = profileData?.data;

  const {
    cartItems, subTotal, totalPrice, clearCart,
    mrpTotal, totalDiscountOnMrp, handlingFee, platformFee,
    deliveryFee, couponDiscount, gstAmount, applyCoupon,
  } = useCart();

  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [orderType, setOrderType] = useState('Home Delivery');

  const effectiveDeliveryFee = orderType === 'Pickup Reservation' ? 0 : deliveryFee;
  const effectiveTotalPrice = totalPrice - deliveryFee + effectiveDeliveryFee;

  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Set the default address once the user data is loaded from the API
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddressId(user.addresses[0]._id);
    }
  }, [user]); // This now depends on the API-fetched user

  const isPrescriptionRequired = useMemo(() => cartItems.some(item => item.product.requiresPrescription), [cartItems]);

  const handlePayment = async () => {
    if (cartItems.length === 0) return toast.error("Your cart is empty.");
    const isPickup = orderType === 'Pickup Reservation';
    if (!isPickup && (!user?.addresses || user.addresses.length === 0)) return toast.error("Please add a shipping address in your profile first.");
    if (!isPickup && !selectedAddressId) return toast.error("Please select a shipping address.");
    if (isPrescriptionRequired && !prescriptionFile) return toast.error("This order requires a prescription.");

    setPaymentLoading(true);

    try {
      const shippingAddress = (!isPickup && user?.addresses) ? user.addresses.find(addr => addr._id === selectedAddressId) : null;
      const formattedOrderItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.variant ? item.variant.price : item.price,
        product: item.product._id
      }));

      const firstShopId = cartItems[0].product.shop._id;
      const allFromSameShop = cartItems.every(item => item.product.shop._id === firstShopId);
      if (!allFromSameShop) {
        toast.error("You can only order from one shop at a time.");
        setPaymentLoading(false);
        return;
      }

      const pricingDetails = {
        itemsPrice: subTotal,
        mrpTotal: mrpTotal,
        totalDiscountOnMrp: totalDiscountOnMrp,
        handlingFee: handlingFee,
        platformFee: platformFee,
        deliveryFee: effectiveDeliveryFee,
        couponDiscount: couponDiscount,
        gstAmount: gstAmount,
        totalPrice: effectiveTotalPrice, // This is the final amount
      };
      console.log(pricingDetails);

      const orderPayload = new FormData();
      orderPayload.append('orderItems', JSON.stringify(formattedOrderItems));
      if (shippingAddress) {
        orderPayload.append('shippingAddress', JSON.stringify(shippingAddress));
      }
      orderPayload.append('orderType', orderType);
      orderPayload.append('paymentMethod', 'Online');
      orderPayload.append('shopId', firstShopId);
      orderPayload.append('pricing', JSON.stringify(pricingDetails));
      if (isPrescriptionRequired) {
        orderPayload.append('prescription', prescriptionFile);
      }
      console.log(orderPayload);

      const medilinkOrderResponse = await createOrder(orderPayload);
      const medilinkOrder = medilinkOrderResponse.data;
      if (!medilinkOrder?._id) throw new Error("Failed to create order.");

      if (isPrescriptionRequired) {
        toast.success("Order Submitted. Pending Prescription Approval.");
        clearCart();
        navigate(`/orders/${medilinkOrder._id}`);
        setPaymentLoading(false);
        return;
      }

      const razorpayOrder = await paymentService.createRazorpayOrder({ amount: totalPrice, currency: 'INR', receipt: medilinkOrder._id });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          const verificationData = { ...response, order_id: medilinkOrder._id };
          const promise = paymentService.verifyPayment(verificationData);
          toast.promise(promise, {
            loading: 'Verifying payment...',
            success: () => {
              clearCart();
              navigate(`/orders/${medilinkOrder._id}`);
              return 'Payment Successful!';
            },
            error: 'Payment verification failed.',
          });
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#2563EB' },
        modal: { ondismiss: () => setPaymentLoading(false) }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setPaymentLoading(false);
    }
  };
  if (isUserLoading) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;

  if (cartItems.length === 0) return (

    <div className="text-center py-20 bg-secondary rounded-lg shadow-lg flex flex-col items-center">

      <FaShoppingCart className="text-5xl text-primary mb-4" />

      <h2 className="text-2xl font-bold text-text-primary">Your Cart is Empty</h2>

      <p className="text-text-secondary mt-2">Add items to your cart before proceeding to checkout.</p>

      <Link to="/shops" className="mt-6"><Button>Continue Shopping</Button></Link>

    </div>

  );


  return (
    <div className="container mx-auto">
      <Toaster position="top-right" />
      <motion.h1 className="text-4xl font-extrabold text-text-primary mb-8">Checkout</motion.h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center"><FaShippingFast className="mr-3" />1. Order Type</h2>
            <div className="flex space-x-4 mb-6">
              <label className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${orderType === 'Home Delivery' ? 'border-primary bg-primary/10' : 'border-border-color'}`}>
                <input type="radio" value="Home Delivery" checked={orderType === 'Home Delivery'} onChange={(e) => setOrderType(e.target.value)} className="hidden" />
                <span className="font-semibold text-text-primary">Home Delivery</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${orderType === 'Pickup Reservation' ? 'border-primary bg-primary/10' : 'border-border-color'}`}>
                <input type="radio" value="Pickup Reservation" checked={orderType === 'Pickup Reservation'} onChange={(e) => setOrderType(e.target.value)} className="hidden" />
                <span className="font-semibold text-text-primary">Self-Pickup</span>
              </label>
            </div>

            {orderType === 'Home Delivery' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-text-primary">Shipping Address</h3>
                  <Link to="/profile"><Button variant="secondary" className="!text-xs !py-1 flex items-center"><FaPlus className="mr-2" /> Add/Manage</Button></Link>
                </div>
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map(addr => (
                      <label key={addr._id} className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-primary bg-primary/10' : 'border-border-color'}`}>
                        <input type="radio" name="address" value={addr._id} checked={selectedAddressId === addr._id} onChange={(e) => setSelectedAddressId(e.target.value)} />
                        <div className="ml-4 text-sm">
                          <p className="font-semibold text-text-primary">{addr.street}, {addr.city}</p>
                          <p className="text-text-secondary">{addr.state} - {addr.postalCode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary p-4 bg-background rounded-md">You have no saved addresses. Please <Link to="/profile" className="text-primary underline">add an address</Link>.</p>
                )}
              </>
            ) : (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="font-semibold text-text-primary">Pickup in Store</p>
                <p className="text-sm text-text-secondary mt-1 tracking-wide">You will pick this order up from the Shop personally. No delivery charges applied.</p>
              </div>
            )}
          </div>

          {isPrescriptionRequired && (
            <div className="bg-secondary p-6 rounded-lg shadow-lg border border-yellow-500/30">
              <div className="flex items-center mb-4 text-yellow-500 font-bold text-xl">
                <FaFileMedical className="mr-3" />
                <h2>2. Upload Prescription</h2>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Some items in your cart require a valid prescription. Please attach an image of your prescription to proceed.
              </p>

              <div className="flex items-center justify-center w-full relative">
                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-primary-dark/10 hover:bg-primary-dark/20 transition-colors ${prescriptionFile ? 'border-green-500/50' : 'border-gray-600'}`}>
                  {prescriptionFile ? (
                    <div className="flex flex-col items-center justify-center p-4">
                      {prescriptionFile.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(prescriptionFile)} alt="Preview" className="h-28 object-contain rounded mb-2 shadow-md" />
                      ) : (
                        <FaFileMedical className="w-12 h-12 text-green-500 mb-2" />
                      )}
                      <p className="text-sm font-semibold text-green-400 truncate max-w-xs">{prescriptionFile.name}</p>
                      <p className="text-xs text-text-secondary mt-1 hover:text-red-400 cursor-pointer" onClick={(e) => { e.preventDefault(); setPrescriptionFile(null); }}>Click to remove</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                  )}
                  <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setPrescriptionFile(e.target.files[0])} />
                </label>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div className="lg:col-span-1 space-y-6 sticky top-24" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
          {/* <div className="bg-secondary p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary flex items-center"><FaTags className="mr-2" />Offers & Discounts</h3>
              <Button variant="secondary" onClick={() => setIsCouponModalOpen(true)} className="!text-xs !py-1">View Coupons</Button>
            </div>
            {appliedCoupon && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs flex justify-between items-center">
                <p>Applied: <span className="font-bold text-green-400">{appliedCoupon.code}</span></p>
                <button onClick={removeCoupon} className="text-red-400"><FaTimes /></button>
              </div>
            )}
          </div> */}

          <div className="bg-secondary p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold border-b border-border-color pb-4 mb-4 text-primary">CART BREAKDOWN</h2>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Cart Total (MRP)</span><span>{formatCurrency(mrpTotal)}</span></div>
              {/*<div className="flex justify-between text-green-500"><span>Discount on MRP</span><span>- {formatCurrency(totalDiscountOnMrp)}</span></div>*/}
              <div className="flex justify-between"><span>Handling Fee</span><span>{formatCurrency(handlingFee)}</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(platformFee)}</span></div>
              <div className="flex justify-between"><span>Delivery Charges</span><span className={effectiveDeliveryFee === 0 ? 'text-green-500' : ''}>{effectiveDeliveryFee === 0 ? 'FREE' : formatCurrency(effectiveDeliveryFee)}</span></div>
              <div className="flex justify-between"><span>GST/Taxes (12%)</span><span>{formatCurrency(gstAmount)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Coupon Discount</span><span>- {formatCurrency(couponDiscount)}</span></div>}
              <div className="flex justify-between font-bold text-lg border-t border-border-color pt-4 mt-4 text-text-primary">
                <span>To Pay</span>
                <span>{formatCurrency(effectiveTotalPrice)}</span>
              </div>
            </div>
            <Button onClick={handlePayment} disabled={paymentLoading} className="w-full !py-3 !text-base mt-6">
              {paymentLoading ? <Spinner size="sm" /> : `Place Order`}
            </Button>
          </div>
        </motion.div>
      </div>
      <ApplyCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        applyCoupon={applyCoupon}
      />
    </div>
  );
};

export default CheckoutPage;