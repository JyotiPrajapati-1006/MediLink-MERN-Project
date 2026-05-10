import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaUser, FaBoxOpen, FaFileMedical, FaHeart, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../../public/logo-transparent-png.png';
import ThemeToggle from '../common/ThemeToggle';

// --- Reusable NavLink Component ---
const CustomNavLink = ({ to, children, onClick }) => (
  <NavLink to={to} onClick={onClick} className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white bg-primary' : 'text-text-secondary hover:bg-gray-700 hover:text-white'}`}>
    {children}
  </NavLink>
);

// --- Profile Dropdown Component ---
const ProfileDropdown = ({ user, logout, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onLinkClick) onLinkClick();
  };

  // Special case for non-customer roles who don't need a complex dropdown
  if (user.role !== 'customer') {
    return (
      <div className='flex items-center'>
        <span className="text-text-primary font-medium mr-4">{user.name}</span>
        <button onClick={logout} className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-md"><FaSignOutAlt className="mr-2" />Logout</button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 focus:outline-none">
        <span className="text-text-primary font-medium">{user.name}</span>
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-56 bg-secondary-dark rounded-md shadow-lg py-1 z-50 border border-gray-700">
            <Link to="/profile" onClick={handleLinkClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-700 hover:text-white"><FaUser className="mr-3" />My Profile</Link>
            <Link to="/orders" onClick={handleLinkClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-700 hover:text-white"><FaBoxOpen className="mr-3" />My Orders</Link>
            <Link to="/prescriptions" onClick={handleLinkClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-700 hover:text-white"><FaFileMedical className="mr-3" />My Prescriptions</Link>
            <div className="border-t border-gray-700 my-1"></div>
            <Link to="/support" onClick={handleLinkClick} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-gray-700 hover:text-white"><FaQuestionCircle className="mr-3" />Help & Support</Link>
            <button onClick={logout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-white"><FaSignOutAlt className="mr-3" />Logout</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  const renderNavLinks = () => {
    if (isAuthenticated && user.role == "delivery-staff") {
      return <CustomNavLink to='/delivery/dashboard' onClick={handleLinkClick}>Delivery Dashboard</CustomNavLink>

    } else {
      return (
        <>
          <CustomNavLink to="/" onClick={handleLinkClick}>Home</CustomNavLink>
          <CustomNavLink to="/shops" onClick={handleLinkClick}>Shops</CustomNavLink>
          <CustomNavLink to="/about" onClick={handleLinkClick}>About Us</CustomNavLink>
          <CustomNavLink to="/contact" onClick={handleLinkClick}>Contact Us</CustomNavLink>
        </>
      );
    }
    return (
      <>
        <CustomNavLink to="/" onClick={handleLinkClick}>Home</CustomNavLink>
        <CustomNavLink to="/shops" onClick={handleLinkClick}>Shops</CustomNavLink>
        <CustomNavLink to="/about" onClick={handleLinkClick}>About Us</CustomNavLink>
        <CustomNavLink to="/contact" onClick={handleLinkClick}>Contact Us</CustomNavLink>
      </>
    );
  }

  return (
    <header className="bg-secondary-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/home"><img src={logo} className='h-[70px] w-[170px]' alt="MediLink" /></Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">{renderNavLinks()}</nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {isAuthenticated && user?.role === 'customer' && (
              <div className="flex items-center space-x-1">
                <Link to="/cart" className="relative text-text-secondary hover:text-white p-2 rounded-full hover:bg-gray-700">
                  <FaShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-red-100 bg-red-600 rounded-full">{itemCount}</span>}
                </Link>
                <Link to="/wishlist" className="hidden sm:block relative text-text-secondary hover:text-white p-2 rounded-full hover:bg-gray-700"><FaHeart className="w-5 h-5" /></Link>
              </div>
            )}
            <ThemeToggle />
            {/* Desktop Profile/Login Buttons */}
            <div className="hidden md:flex items-center">
              {isAuthenticated && user ? (
                <ProfileDropdown user={user} logout={logout} />
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium bg-secondary-dark text-text-secondary hover:text-primary">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-text-secondary hover:text-white p-2 rounded-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-secondary-dark border-t border-gray-700">
            <nav className="flex flex-col p-4 space-y-2">
              {renderNavLinks()}
              <div className="border-t border-gray-700 pt-4 mt-2">
                {isAuthenticated && user ? (
                  <ProfileDropdown user={user} logout={logout} onLinkClick={handleLinkClick} />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <CustomNavLink to="/login" onClick={handleLinkClick}>Login</CustomNavLink>
                    <CustomNavLink to="/register" onClick={handleLinkClick}>Sign Up</CustomNavLink>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;