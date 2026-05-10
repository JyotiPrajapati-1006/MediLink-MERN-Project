import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Input from '../../components/common/Input';
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../api/authService';

// --- Sub-component for Password Strength Indicator ---
const PasswordStrengthIndicator = ({ password }) => {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const Requirement = ({ label, isMet }) => (
    <li className={`flex items-center text-xs transition-colors ${isMet ? 'text-green-400' : 'text-red-400'}`}>
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

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = location.state?.role || 'customer';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: initialRole });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth(); // We need login for Google auth flow

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'name') processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'phone') processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordChecks = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      specialChar: /[^A-Za-z0-9]/.test(formData.password),
    };
    if (!Object.values(passwordChecks).every(Boolean)) newErrors.password = "Password does not meet all requirements.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});

    try {
      await authService.sendRegistrationOtp(formData.email);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { userData: formData } });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP.';
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      // Manually update the auth context after a successful Google login
      login({ email: response.data.email, password: null }, true, response);
      toast.success('Google Login Successful!');
      navigate("/");
      window.location.reload();
    } catch (err) {
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end min-h-screen bg-primary-dark">
      <Toaster position="top-right" />
      <motion.div className="w-full max-w-md h-full m-auto p-8 space-y-6 bg-secondary-dark rounded-xl shadow-2xl" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Create Your Account</h2>
          <p className="mt-2 text-sm text-text-secondary">Join MediLink today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required error={errors.name} icon={<FaUser className="w-5 h-5 text-gray-400" />} />
          <Input id="email" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required error={errors.email} icon={<FaEnvelope className="w-5 h-5 text-gray-400" />} />
          <Input id="phone" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required error={errors.phone} icon={<FaPhone className="w-5 h-5 text-gray-400" />} />
          <div>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={handleChange} required error={errors.password} icon={<FaLock className="w-5 h-5 text-gray-400" />} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.password.length > 0 && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>
          <div className="relative">
            <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required error={errors.confirmPassword} icon={<FaLock className="w-5 h-5 text-gray-400" />} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <Button type="submit" className="w-full !py-3 !text-base" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Continue to OTP'}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
          <div className="relative flex justify-center text-sm"><span className="bg-secondary-dark px-2 text-text-secondary">OR</span></div>
        </div>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Login Failed')} theme="outline" size="large" />
        </div>
        <p className="text-sm text-center text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      </motion.div>
      <div className="hidden lg:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="w-full h-full bg-black/60 flex flex-col justify-center p-12">
          <motion.h1 className="text-4xl font-bold text-white" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Welcome to MediLink
          </motion.h1>
          <motion.p className="text-gray-300 mt-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            "Your Health, Connected — Simple & Secure"
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;