import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../api/authService';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import { FaEnvelope } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setAuthLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  // --- OTP Flow for Passwordless Login ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Call the service to send a passwordless login OTP
      await authService.sendPasswordlessLoginOtp(email);
      toast.success('OTP has been sent to your email!');

      // Step 2: Navigate to the OTP verification page with login data
      navigate('/verify-otp', {
        state: {
          loginData: { email }, // Pass only the email
          mode: 'passwordless-login' // Specify the new mode
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. User may not exist.');
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login Flow ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      setAuthLogin(response); // Manually update the global auth state
      toast.success('Google Login Successful!');

      navigate('/');
      window.location.reload();

    } catch (err) {
      toast.error(`${err.response?.data?.message}`);
      console.log(err.message);

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
            <h2 className="text-3xl font-bold text-text-primary">Login to Your Account</h2>
            <p className="mt-2 text-sm text-text-secondary">Enter your email to receive a login OTP.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<FaEnvelope className="w-5 h-5 text-gray-400" />}
            />
            <Button type="submit" className="w-full !py-3 !text-base" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Send OTP'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-secondary-dark px-2 text-text-secondary">OR</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Login Failed')} theme="outline" size="large" />
          </div>

          <p className="text-sm text-center text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;