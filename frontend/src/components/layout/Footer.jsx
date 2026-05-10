import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // 1. AuthContext ને import કરો
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  // 2. Get user authentication status and role
  const { isAuthenticated, user } = useAuth();

  // Condition to show certain links only to guests and customers
  const showCustomerLinks = !isAuthenticated || user?.role === 'customer';

  return (
    <footer className="bg-secondary-dark text-text-secondary border-t border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* The grid will dynamically adjust based on whether links are shown */}
        <div className={`grid grid-cols-1 md:grid-cols-3 ${showCustomerLinks ? 'lg:grid-cols-4' : ''} gap-8`}>

          {/* About Section (Always visible) */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-primary mb-4">MediLink</h3>
            <p className="text-sm">
              Your trusted partner for online medicine ordering and fast, reliable delivery.
            </p>
          </div>

          {/* Quick Links Section (Conditionally rendered) */}
          {showCustomerLinks && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shops" className="hover:text-primary transition-colors">Pharmacies</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          )}

          {/* Legal Section (Always visible) */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Media Section (Always visible) */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-text-secondary hover:text-primary transition-colors"><FaFacebook size={20} /></a>
              <a href="#" aria-label="Twitter" className="text-text-secondary hover:text-primary transition-colors"><FaTwitter size={20} /></a>
              <a href="#" aria-label="Instagram" className="text-text-secondary hover:text-primary transition-colors"><FaInstagram size={20} /></a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MediLink. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;