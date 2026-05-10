import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../api/authService';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // To show a success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset link sent! Please check your email.');
      setSubmitted(true); // Show the success state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
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
        {submitted ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FaEnvelope className="text-4xl text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Check Your Email</h2>
            <p className="mt-2 text-sm text-text-secondary">
              A link to reset your password has been sent to <span className="font-semibold text-primary">{email}</span>.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <Button>Back to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text-primary">Forgot Password?</h2>
              <p className="mt-2 text-sm text-text-secondary">No worries, we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<FaEnvelope className="w-5 h-5 text-gray-400" />}
              />
              <Button type="submit" className="w-full !py-3 !text-base" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
              </Button>
            </form>

            <p className="text-sm text-center text-text-secondary">
              <Link to="/" className="font-medium text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;