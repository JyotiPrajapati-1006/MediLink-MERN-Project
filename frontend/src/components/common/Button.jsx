// src/components/common/Button.jsx

import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  // Define base styles for the button
  const baseStyles =
    'px-5 py-2.5 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary-dark transition-all duration-300 transform';

  // Define styles for different variants, optimized for the dark theme
  const variants = {
    primary: 'bg-primary text-white cursor-pointer hover:bg-blue-500 focus:ring-primary',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer',
  };

  // Define styles for disabled state
  const disabledStyles = 'opacity-40 cursor-not-allowed';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
      // Framer Motion animation props
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export default Button;