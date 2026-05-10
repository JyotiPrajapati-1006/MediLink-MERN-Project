import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import Input from '../../components/common/Input';

// --- Dummy FAQ Data ---
const faqs = [
  { q: "How do I place an order?", a: "You can browse medicines using the search bar or categories. Add items to your cart and proceed to checkout to place your order." },
  { q: "How do I upload a prescription?", a: "If an item in your cart requires a prescription, a special upload form will automatically appear on the checkout page." },
  { q: "What are the delivery charges?", a: "Delivery charges may vary based on your location and order value. Often, orders above a certain amount have free delivery." },
  { q: "How can I track my order?", a: "You can track the status of your order in the 'My Orders' section in your profile dropdown." },
  { q: "What is your return policy?", a: "Due to safety regulations, we do not accept returns on medicines. However, if you receive a wrong or damaged product, please contact our support immediately." },
];

// --- Sub-component for a single FAQ item (Accordion) ---
const FaqItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-700 py-4">
      <button
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{faq.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <p className="text-text-secondary pr-4">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = useMemo(() =>
    faqs.filter(faq =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]);

  return (
    <motion.div
      className="container mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* --- Hero Section --- */}
      <div className="text-center py-12 bg-secondary-dark rounded-lg">
        <FaQuestionCircle className="mx-auto text-5xl text-primary mb-4" />
        <h1 className="text-4xl font-extrabold text-text-primary">Help & Support</h1>
        <p className="mt-2 text-text-secondary">We're here to help you with any questions you may have.</p>
        <div className="mt-6 max-w-lg mx-auto">
          <Input
            placeholder="Search for a question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- FAQ Section --- */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-text-primary mb-6">Frequently Asked Questions</h2>
        <div className="bg-secondary-dark p-6 rounded-lg">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => <FaqItem key={index} faq={faq} />)
          ) : (
            <p className="text-text-secondary text-center py-4">No questions found matching your search.</p>
          )}
        </div>
      </div>

      {/* --- Contact Section --- */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-6">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-secondary-dark p-8 rounded-lg text-center">
            <FaEnvelope className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-text-primary">Email Support</h3>
            <p className="text-text-secondary mt-2">Get a response within 24 hours.</p>
            <a href="mailto:support@medilink.com" className="text-primary font-bold mt-4 inline-block">support@medilink.com</a>
          </div>
          <div className="bg-secondary-dark p-8 rounded-lg text-center">
            <FaPhone className="mx-auto text-4xl text-primary mb-4" />
            <h3 className="text-2xl font-semibold text-text-primary">Phone Support</h3>
            <p className="text-text-secondary mt-2">Mon-Fri, 9am - 6pm IST.</p>
            <a href="tel:+911234567890" className="text-primary font-bold mt-4 inline-block">+91 123-456-7890</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportPage;