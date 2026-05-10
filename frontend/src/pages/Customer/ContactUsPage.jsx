import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import contactService from '../../api/contactService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const ContactUsPage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const promise = contactService.submitContactForm(formData);

    try {
      await toast.promise(promise, {
        loading: 'Sending message...',
        success: 'Message sent successfully!',
        error: (err) => err.response?.data?.message || 'Failed to send message.',
      });
      // Clear only subject and message
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
    } catch (error) {
      // Error is handled by toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <Toaster position="top-right" />
      <motion.div className="text-center mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Contact Us</h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">We're here to help. Send us a message!</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div className="bg-secondary-dark p-8 rounded-lg shadow-lg" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input name="name" label="Full Name" value={formData.name} onChange={handleChange} disabled={!!user} required />
            <Input name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} disabled={!!user} required />
            <Input name="subject" label="Subject" value={formData.subject} placeholder="Enter subject" onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Message</label>
              <textarea name="message" value={formData.message} placeholder='Enter your message' onChange={handleChange} required rows="5" className="w-full p-2 bg-secondary-dark text-text-primary border border-gray-600  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 rounded-md"></textarea>
            </div>
            <Button type="submit" disabled={loading} className="w-full !py-3">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="bg-secondary-dark p-6 rounded-lg flex items-start gap-4">
            <FaMapMarkerAlt className="text-primary text-3xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Our Office</h3>
              <p className="text-text-secondary">123 Health Street, Pharmacy Nagar, Ahmedabad, Gujarat - 380001</p>
            </div>
          </div>
          <div className="bg-secondary-dark p-6 rounded-lg flex items-start gap-4">
            <FaEnvelope className="text-primary text-3xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Email Us</h3>
              <p className="text-text-secondary">Get a response within 24 hours.</p>
              <a href="mailto:support@medilink.com" className="text-primary hover:underline">support@medilink.com</a>
            </div>
          </div>
          <div className="bg-secondary-dark p-6 rounded-lg flex items-start gap-4">
            <FaPhoneAlt className="text-primary text-3xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Call Us</h3>
              <p className="text-text-secondary">Mon-Fri, 9am - 6pm IST.</p>
              <a href="tel:+911234567890" className="text-primary hover:underline">+91 123-456-7890</a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }}>
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Find Us Here</h2>
        <div className="rounded-lg overflow-hidden border-2 border-gray-700">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117503.4332997383!2d72.4848979432696!3d23.02024329241517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e848aba5bd449%3A0x4fcedd11614f6516!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1677658883581!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUsPage;