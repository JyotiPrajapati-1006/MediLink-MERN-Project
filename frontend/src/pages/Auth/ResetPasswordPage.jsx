import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import authService from '../../api/authService';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// --- Sub-component for Password Strength Indicator ---
const PasswordStrengthIndicator = ({ password }) => {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const Requirement = ({ label, isMet }) => (
    <li className={`flex items-center text-xs transition-colors ${isMet ? 'text-green-400' : 'text-text-secondary'}`}>
      {isMet ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />} {label}
    </li>
  );

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
      <Requirement label="At least 8 characters" isMet={checks.length} />
      <Requirement label="One uppercase letter" isMet={checks.uppercase} />
      <Requirement label="One number" isMet={checks.number} />
      <Requirement label="One special character" isMet={checks.specialChar} />
    </ul>
  );
};

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordChecks = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      specialChar: /[^A-Za-z0-9]/.test(formData.password),
    };

    if (!Object.values(passwordChecks).every(Boolean)) {
      newErrors.password = "Password does not meet all requirements.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      setAuthLogin(response); // Auto-login the user
      toast.success('Password has been reset successfully!');
      navigate('/'); // Navigate to the homepage
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
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
          <h2 className="text-3xl font-bold text-text-primary">Reset Your Password</h2>
          <p className="mt-2 text-sm text-text-secondary">Enter a new strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Input
                id="password" name="password" type={showPassword ? 'text' : 'password'}
                placeholder="New Password" value={formData.password} onChange={handleChange} required
                icon={<FaLock className="w-5 h-5 text-gray-400" />}
                error={errors.password}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="relative">
            <Input
              id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} required
              icon={<FaLock className="w-5 h-5 text-gray-400" />}
              error={errors.confirmPassword}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <Button type="submit" className="w-full !py-3 !text-base" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Reset Password'}
          </Button>
        </form>

        <p className="text-sm text-center text-text-secondary">
          Remember your password?{' '}
          <Link to="/" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;