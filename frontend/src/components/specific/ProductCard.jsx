import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { FaCartPlus, FaHeart, FaRegHeart } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { isItemInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const inWishlist = isItemInWishlist(product._id);
  const isVariable = product.variants && product.variants.length > 0;
  const imageUrl = product.images?.[0] || 'https://i.imgur.com/gUPd5n5.jpeg';
  const displayPrice = useMemo(() => {
    if (isVariable) {
      const prices = product.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) return formatCurrency(minPrice);
      return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    }
    return formatCurrency(product.price || 0);
  }, [product, isVariable]);

  const cartItem = useMemo(() => {
    if (isVariable) return null;
    return cartItems.find(item => item.product._id === product._id || item.product === product._id);
  }, [cartItems, product._id, isVariable]);

  const discountPercentage = !isVariable && product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to manage your wishlist.");
      navigate("/");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product._id);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/"); // Redirect to the new login route '/'
      return;
    }
    if (isVariable) {
      navigate(`/product/${product._id}`);
      return;
    }
    addToCart(product, 1);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product._id, cartItem.quantity + 1, null);
    }
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(product._id, null);
      } else {
        updateQuantity(product._id, cartItem.quantity - 1, null);
      }
    }
  };

  return (

    <motion.div
      className="bg-secondary rounded-lg shadow-lg overflow-hidden border border-border-color flex flex-col group"
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <Link to={`/product/${product._id}`} className="flex flex-col h-full">
        <div className="relative">
          <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover" />
          <button onClick={handleWishlistToggle} className="absolute top-2 left-2 bg-secondary/80 p-2 rounded-full text-text-primary hover:text-red-500 transition-colors z-10">
            {inWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          {product.requiresPrescription && (
            <span className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full font-semibold">
              Rx Required
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="absolute bottom-2 left-2 bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-md font-bold">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-text-secondary mb-1">{product.brand}</p>
          <h3 className="text-lg font-semibold text-text-primary truncate flex-grow" title={product.name}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-4 h-10">
            <span className="text-xl font-bold text-text-primary">{displayPrice}</span>

            {cartItem ? (
              <div className="flex items-center border border-primary rounded-md overflow-hidden bg-primary/20" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <button onClick={handleDecrease} className="px-3 py-1.5 text-primary font-extrabold hover:bg-primary/30 transition-colors">-</button>
                <span className="px-3 py-1.5 font-bold text-text-primary w-8 text-center">{cartItem.quantity}</span>
                <button onClick={handleIncrease} className="px-3 py-1.5 text-primary font-extrabold hover:bg-primary/30 transition-colors">+</button>
              </div>
            ) : (
              <Button
                onClick={handleAddToCart}
                variant="primary"
                className="!px-3 !py-2"
                disabled={!isVariable && product.countInStock === 0}
              >
                <FaCartPlus size={18} />
              </Button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;