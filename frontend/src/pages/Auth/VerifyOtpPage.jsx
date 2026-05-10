import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthLogin } = useAuth(); // Rename to avoid conflict

  // Get data passed from RegisterPage or LoginPage
  const { userData, loginData } = location.state || {};
  const mode = loginData ? 'login' : 'register';
  const email = userData?.email || loginData?.email;

  // Countdown timer for the "Resend OTP" button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // If a user lands on this page directly, redirect them
  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const promise = (mode === 'login')
        ? authService.sendLoginOtp(loginData)
        : authService.sendRegistrationOtp(email);

      await toast.promise(promise, {
        loading: 'Resending OTP...',
        success: 'A new OTP has been sent.',
        error: 'Failed to resend OTP.'
      });
      setResendCooldown(30); // Reset the timer
    } catch (error) {
      // Error is handled by toast
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (mode === 'login') {
        const finalLoginData = { ...loginData, otp };
        response = await authService.verifyPasswordlessLogin(finalLoginData);
      } else { // Register mode
        const finalUserData = { ...userData, otp };
        response = await authService.verifyOtpAndRegister(finalUserData);
        alert("your medilink account create successfull! Welcome ");
      }

      setAuthLogin(response); // Update the global auth state

      toast.success(`Verification Successful! Welcome, ${response.data.name}.`);

      navigate('/');
      window.location.reload();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Invalid OTP.');
      console.log(err.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-dark p-4">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-secondary-dark rounded-xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FaEnvelope className="text-4xl text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Verify Your Email</h2>
          <p className="text-center text-sm text-text-secondary mt-2">
            An OTP has been sent to <span className="font-semibold text-primary">{email}</span>.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="otp"
            name="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength="6"
            required
          />
          <Button type="submit" disabled={loading} className="w-full !py-3 !text-base">
            {loading ? <Spinner size="sm" /> : `Verify & ${mode === 'login' ? 'Login' : 'Register'}`}
          </Button>
        </form>
        <div className="text-center text-sm text-text-secondary">
          {resendCooldown > 0 ? (
            <span>Resend OTP in {resendCooldown}s</span>
          ) : (
            <button onClick={handleResendOtp} className="font-medium text-primary hover:underline cursor-pointer">
              Didn't receive code? Resend
            </button>
          )}
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          Wrong details? <Link to={mode === 'login' ? '/' : '/register'} className="font-medium text-primary hover:underline">Go Back</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;