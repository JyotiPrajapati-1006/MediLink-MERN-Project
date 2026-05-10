import React from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaShippingFast, FaShieldAlt, FaUserMd } from 'react-icons/fa';
import img from '../../../public/banner-logo.png';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

// Sub-component for Team Member Card
const TeamMemberCard = ({ image, name, title }) => (
  <motion.div
    className="text-center bg-secondary-dark p-6 rounded-lg border border-gray-700/50"
    whileHover={{ scale: 1.05, y: -10 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <img src={image} alt={name} className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-primary" />
    <h3 className="text-xl font-bold text-text-primary">{name}</h3>
    <p className="text-primary">{title}</p>
  </motion.div>
);

// Sub-component for Value Card
const ValueCard = ({ icon, title, description }) => (
  <div className="bg-secondary-dark p-6 rounded-lg text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </div>
);


const AboutUsPage = () => {
  return (
    <div className="text-text-primary space-y-24">
      {/* 1. Hero Section */}
      <motion.section
        className="relative py-24 px-4 text-center rounded-xl overflow-hidden bg-secondary-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-primary-dark opacity-50"></div>
        <div className="relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            About <span className='text-primary'>MEDILINK</span>
          </motion.h1>
          <motion.p
            className="mt-4 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Connecting you to better health, faster and simpler than ever before.
          </motion.p>
        </div>
      </motion.section>

      {/* 2. Our Mission Section */}
      <motion.section
        className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" alt="Our Mission" className="rounded-lg shadow-xl" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-primary mb-4">Our Mission</h2>
          <p className="text-text-secondary leading-relaxed">
            At MediLink, our mission is to make healthcare accessible, affordable, and convenient for everyone. We believe that technology can bridge the gap between patients and pharmacies, ensuring timely access to essential medicines. We are committed to building a reliable platform that prioritizes your health and well-being above all else.
          </p>
        </div>
      </motion.section>

      {/* 3. Our Team Section */}
      <motion.section
        className="container mx-auto"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <TeamMemberCard image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Ac7W-pTe1xqOMFavLbC3DLAmplPEYfkb1Q&s" name="Dr. Aanya Sharma" title="Founder & CEO" />
          <TeamMemberCard image="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" name="Rohan Verma" title="Head of Technology" />
          <TeamMemberCard image="https://thumbs.dreamstime.com/b/young-indian-woman-23082467.jpg" name="Priya Patel" title="Lead Pharmacist" />
          <TeamMemberCard image="	https://t3.ftcdn.net/jpg/01/87/83/26/360_F_187832626_Z0K54NuFDzPM10NZw6gWdRYMC763xJQM.jpg" name="Shradha Singh" title="Logistics Head" />
        </div>
      </motion.section>

      {/* 4. Our Values Section */}
      <motion.section
        className="container mx-auto"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon={<FaShieldAlt className="text-green-400 text-4xl" />}
            title="Trust & Safety"
            description="We partner only with verified pharmacies to ensure authentic medicines."
          />
          <ValueCard
            icon={<FaShippingFast className="text-blue-400 text-4xl" />}
            title="Speed & Convenience"
            description="A seamless ordering experience with fast, on-time delivery."
          />
          <ValueCard
            icon={<FaHeartbeat className="text-red-400 text-4xl" />}
            title="Customer Care"
            description="We are dedicated to providing compassionate support for all your needs."
          />
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUsPage;