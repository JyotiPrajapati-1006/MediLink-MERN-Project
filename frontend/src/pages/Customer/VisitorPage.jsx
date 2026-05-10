import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Button from '../../components/common/Button';
import { FaSearch, FaUpload, FaTruck, FaStore, FaUserPlus, FaSignInAlt, FaHeart } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import couponService from '../../api/couponService';

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", once: true }
  }
};

const VisitorPage = () => {
  const [activeCoupons, setActiveCoupons] = useState([]);

  useEffect(() => {
    couponService.getAllActiveCoupons()
      .then(res => setActiveCoupons(res.data))
      .catch(err => console.error("Failed to fetch coupons: ", err));
  }, []);

  const slideImages = [
    "https://plus.unsplash.com/premium_photo-1682310231531-148748e7684f?q=80&w=1212&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=1887&auto=format&fit=crop",
  ];

  return (
    <div className="space-y-24">
      <Toaster position="top-right" />

      {/* 1. Hero Section */}
      <section className="relative h-[85vh] -mt-8 rounded-b-[3rem] overflow-hidden flex items-center justify-center text-center shadow-2xl">
        <div className="absolute inset-0 z-0">
          <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade" loop={true} pagination={{ clickable: true }} autoplay={{ delay: 3500, disableOnInteraction: false }} className="h-full w-full">
            {slideImages.map((img, index) => (
              <SwiperSlide key={index}>
                <div className="h-full w-full bg-cover bg-center transition-transform duration-[10s] hover:scale-105" style={{ backgroundImage: `url(${img})` }} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10"></div>

        <motion.div className="relative z-20 p-6 max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className='mb-4 flex justify-center'>
            <span className='px-4 py-1 rounded-full bg-primary/80 text-white text-sm font-medium tracking-wide border border-primary-light/50 backdrop-blur-sm'>
              Welcome to MediLink
            </span>
          </motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            Healthcare Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Simple.</span>
          </motion.h1>
          <motion.p className="mt-6 text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            Connect with local pharmacies, order medicines, and manage your prescriptions - all in one place.
          </motion.p>

          <motion.div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link to="/login">
              <Button className="!text-lg !px-8 !py-4 shadow-xl shadow-primary/30 flex items-center justify-center gap-2 w-full sm:w-auto">
                <FaSignInAlt /> Login to Store
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" className="!text-lg !px-8 !py-4 !bg-white/10 !text-white backdrop-blur-md hover:!bg-white/20 border border-white/30 w-full sm:w-auto flex items-center justify-center gap-2">
                <FaUserPlus /> Join Now
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 1.5. Live Coupon Advertisements */}
      {activeCoupons.length > 0 && (
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" className="relative container mx-auto px-4 mt-12 pt-8">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-8">Exclusive Online Offers</h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={activeCoupons.length > 3}
            autoplay={{ delay: 4000 }}
            className="pb-10"
          >
            {activeCoupons.map((coupon) => (
              <SwiperSlide key={coupon._id}>
                <div className="bg-secondary rounded-xl shadow-lg border border-primary/20 overflow-hidden relative group">
                  <div className="h-40 w-full bg-secondary-dark relative">
                    {coupon.image ? (
                      <img src={coupon.image} alt={coupon.code} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">PROMO</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xs text-blue-300 font-bold tracking-wider uppercase">{coupon.shop?.name}</p>
                      <h3 className="text-2xl font-black text-white">{coupon.discountPercent}% OFF</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-primary/10">
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Use Code</p>
                      <p className="font-mono font-bold text-lg tracking-widest text-primary">{coupon.code}</p>
                    </div>
                    <Link to={`/login`}>
                      <Button className="!py-1 !px-3 !text-xs !rounded-full">Shop Now</Button>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.section>
      )}

      {/* 2. Features Grid */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FaStore, title: 'Find Local Pharmacies', desc: 'Browse a vast network of nearby pharmacies to get your medicines.' },
            { icon: FaSearch, title: 'Search Medicines', desc: 'Find medicines directly from your selected shop’s inventory.' },
            { icon: FaTruck, title: 'Home Delivery', desc: 'Get fast, contactless delivery right to your doorstep.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="text-center p-8 bg-secondary rounded-2xl shadow-lg border border-border-color hover:border-primary/50 transition-colors"
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="bg-primary/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 text-primary">
                <feature.icon className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Pharmacy Partner CTA */}
      <motion.section className="bg-gradient-to-r from-primary to-blue-600 py-16 text-white text-center rounded-none md:rounded-3xl mx-0 md:mx-4 shadow-2xl relative overflow-hidden" variants={sectionVariants} initial="hidden" whileInView="visible">
        <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
          <FaStore className="text-9xl text-white" />
        </div>
        <div className="relative z-10 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner with MediLink</h2>
          <p className="text-blue-100 max-w-xl mx-auto text-lg mb-8">Are you a pharmacy owner? Join our digital network to increase your sales and reach new customers in your locality.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact">
              <Button variant="secondary" className="!bg-white !text-primary hover:!bg-gray-100 font-bold px-8 py-3">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 4. Testimonials */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" className="container mx-auto px-4 pb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-12">Trusted by Thousands</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Sarah J.", city: "New York", quote: "The fastest delivery I've ever experienced. Saved me when I was down with the flu!" },
            { name: "Mike T.", city: "Chicago", quote: "Love the app interface, very easy to find what I need from my local store. Highly recommend." },
            { name: "Emily R.", city: "San Francisco", quote: "Great way to support local pharmacies without leaving the house." },
          ].map((t, i) => (
            <div key={i} className="bg-secondary p-8 rounded-xl shadow-lg border border-border-color">
              <div className="flex text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map(star => <FaHeart key={star} className="text-sm mr-1" />)}
              </div>
              <blockquote className="text-text-secondary italic mb-6">"{t.quote}"</blockquote>
              <div className="font-bold text-text-primary">{t.name}</div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">{t.city}</div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default VisitorPage;
