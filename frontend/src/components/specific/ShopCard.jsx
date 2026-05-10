// src/components/specific/ShopCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { FaStar } from 'react-icons/fa';

const ShopCard = ({ shop }) => {
  console.log(shop);

  return (
    <motion.div
      className="bg-secondary-dark rounded-lg shadow-lg overflow-hidden border border-gray-700/50"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-text-primary">{shop.name}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${shop.isActive ? ' text-green-700' : ' text-red-700'}`}>
            {shop.isActive ? 'Open' : 'Closed'}
          </span>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {shop.address.street}, {shop.address.city}
        </p>
        <div className="flex items-center justify-between mt-4 border-t border-gray-700 pt-4">
          <div className="flex items-center">
            <FaStar className="text-yellow-400" />
            <span className="ml-1 text-text-primary font-semibold">{shop.rating.toFixed(1)}</span>
            <span className="ml-2 text-text-secondary text-sm">({shop.numReviews} reviews)</span>
          </div>
          <Link to={`/shops/${shop._id}`}>
            <Button variant="secondary" className="!text-sm  hover:text-white !py-1.5">Visit Shop</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopCard;