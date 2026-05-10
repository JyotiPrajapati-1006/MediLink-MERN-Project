import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../api/authService';

// Reusable Input with Icon component
const IconInput = ({ id, name, type, placeholder, value, onChange, icon, required }) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      {icon}
    </span>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-3 py-2.5 bg-secondary-dark border border-gray-600 rounded-md text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
    />
  </div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Await the login function to get the full API response
      const response = await login(formData.email, formData.password);

      // 2. Extract the user's role directly from the successful API response
      const userRole = response.data.role;

      toast.success('Login Successful!');

      // 3. Navigate based on the fresh role received from the API
      if (userRole === 'shop-owner') {
        navigate('/shop-owner/dashboard');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-primary-dark">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />

      {/* Left side with background image */}
      <div className="hidden lg:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="w-full h-full bg-black/60 flex flex-col justify-center p-12">
          <motion.h1
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome Back to MediLink
          </motion.h1>
          <motion.p
            className="text-gray-300 mt-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your health, delivered to your doorstep.
          </motion.p>
        </div>
      </div>

      {/* Right side with the login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md p-8 space-y-6 bg-secondary-dark rounded-xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary"> Shop Owner Login</h2>
            <p className="mt-2 text-sm text-text-secondary">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <IconInput
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              icon={<svg className="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>}
            />

            <IconInput
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              icon={<svg className="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h1a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5a2 2 0 012-2h1zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            />

            <Button type="submit" className="w-full !py-3 !text-base" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Login'}
            </Button>
          </form>


        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;