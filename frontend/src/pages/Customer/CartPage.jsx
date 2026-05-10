import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaShoppingCart, FaTags, FaTimes } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';
import ApplyCouponModal from '../../components/specific/ApplyCouponModal';
import Spinner from '../../components/common/Spinner';

// --- Sub-component for a single cart item ---
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const itemPrice = item.price;
  const variantId = item.variant ? item.variant._id : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-secondary p-4 rounded-lg shadow-lg"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{item.name}</h3>
          {item.variant && <p className="text-xs text-text-secondary">{item.variant.name}</p>}
          <p className="text-sm text-text-secondary mt-1">{formatCurrency(itemPrice)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
        <div className="flex items-center border border-primary rounded-md overflow-hidden bg-primary/20">
          <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, variantId)} className="px-3 py-1.5 text-primary font-extrabold hover:bg-primary/30 transition-colors">-</button>
          <span className="px-3 py-1.5 font-bold text-text-primary w-10 text-center">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, variantId)} className="px-3 py-1.5 text-primary font-extrabold hover:bg-primary/30 transition-colors">+</button>
        </div>
        <div className="flex items-center gap-4">
          <p className="w-20 sm:w-24 text-right font-semibold text-text-primary">{formatCurrency(itemPrice * item.quantity)}</p>
          <button onClick={() => removeFromCart(item.product._id, variantId)} className="text-text-secondary hover:text-red-500 p-2"><FaTrash /></button>
        </div>
      </div>
    </motion.div>
  );
};

const CartPage = () => {
  const {
    cartItems, removeFromCart, updateQuantity, clearCart, loading,
    itemCount, mrpTotal, totalDiscountOnMrp,
    handlingFee, platformFee, deliveryFee, couponDiscount, gstAmount, totalPrice,
    applyCoupon, removeCoupon, appliedCoupon
  } = useCart();

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const shopsInCart = useMemo(() => {
    if (!cartItems) return {};
    return cartItems.reduce((acc, item) => {
      const shop = item.product?.shop;
      if (!shop || !shop._id) return acc;
      if (!acc[shop._id]) acc[shop._id] = { name: shop.name, items: [] };
      acc[shop._id].items.push(item);
      return acc;
    }, {});
  }, [cartItems]);

  const currentShopId = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return null;
    return cartItems[0].product?.shop?._id || cartItems[0].product?.shop || cartItems[0].shop;
  }, [cartItems]);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <motion.h1 className="text-4xl font-extrabold text-text-primary mb-8">Your Shopping Cart</motion.h1>

      {cartItems.length === 0 ? (
        <motion.div className="text-center flex items-center flex-col bg-secondary-dark p-12 rounded-lg shadow-lg">
          <FaShoppingCart className="text-5xl text-primary mb-4 " />
          <p className="text-text-secondary text-xl">Your cart is empty.</p>
          <Link to="/shops"><Button className="mt-6">Continue Shopping</Button></Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {Object.entries(shopsInCart).map(([shopId, shopData]) => (
                <motion.div key={shopId} layout>
                  <div className="bg-secondary p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-primary mb-4">Order from: {shopData.name}</h3>
                    <div className="space-y-4">
                      {shopData.items.map(item => (
                        <CartItem key={item.variant ? `${item.product._id}-${item.variant._id}` : item.product._id} item={item} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <div className="bg-secondary p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary flex items-center"><FaTags className="mr-2" />Offers & Discounts</h3>
                <Button variant="secondary" onClick={() => setIsCouponModalOpen(true)} className="!text-xs !py-1">View Coupons</Button>
              </div>
              {appliedCoupon && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs flex justify-between items-center">
                  <p>Applied: <span className="font-bold text-green-400">{appliedCoupon.code}</span></p>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                </div>
              )}
            </div>

            <div className="bg-secondary p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold border-b border-border-color pb-4 mb-4 text-primary">CART BREAKDOWN</h2>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex justify-between"><span>Cart Total (MRP)</span><span>{formatCurrency(mrpTotal)}</span></div>
               {/* <div className="flex justify-between text-green-500"><span>Discount on MRP</span><span>- {formatCurrency(totalDiscountOnMrp)}</span></div>*/} 
                <div className="flex justify-between"><span>Handling & Packaging Fee</span><span>{formatCurrency(handlingFee)}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(platformFee)}</span></div>
                <div className="flex justify-between"><span>Delivery Charges</span><span className={deliveryFee === 0 ? 'text-green-500' : ''}>{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span></div>
                <div className="flex justify-between"><span>GST/Taxes (12%)</span><span>{formatCurrency(gstAmount)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-green-500"><span>Coupon Discount</span><span>- {formatCurrency(couponDiscount)}</span></div>}

                <div className="flex justify-between font-bold text-lg border-t border-border-color pt-4 mt-4 text-text-primary">
                  <span>To Pay</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block mt-6">
                <Button className="w-full !py-3 !text-base">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <ApplyCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        applyCoupon={applyCoupon}
        shopId={currentShopId}
      />
    </div>
  );
};

export default CartPage;