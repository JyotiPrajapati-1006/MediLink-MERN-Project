import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import Spinner from '../../components/common/Spinner';
import ProductCard from '../../components/specific/ProductCard';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeartBroken } from 'react-icons/fa';

const WishlistPage = () => {
  // Get all necessary data and functions from the global WishlistContext
  const { wishlistItems, loading, error } = useWishlist();


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 } // Stagger the animation of child product cards
    }
  };

  // Render loading state
  if (loading) {
    return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  }

  // Render error state
  if (error) {
    return <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>;
  }

  return (
    <div>
      <motion.h1
        className="text-4xl font-extrabold text-text-primary mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Wishlist
      </motion.h1>

      <AnimatePresence>
        {wishlistItems.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {wishlistItems.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        ) : (
          // Render empty wishlist state
          <motion.div
            className="text-center py-20 bg-secondary-dark rounded-lg flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FaHeartBroken className="text-5xl text-primary mb-4" />
            <h2 className="text-2xl font-bold text-text-primary">Your Wishlist is Empty</h2>
            <p className="text-text-secondary mt-2 max-w-md">
              Looks like you haven't added anything to your wishlist yet. Explore our products and save your favorites!
            </p>
            <Link to="/shops" className="mt-6">
              <Button>Browse Shops</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistPage;