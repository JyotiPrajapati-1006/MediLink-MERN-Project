import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Button from '../../components/common/Button';
import { FaSearch, FaUpload, FaTruck, FaStore } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import couponService from '../../api/couponService';
import { useEffect, useState } from 'react';

// Animation variants for sections that slide in from below
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", once: true }
  }
};

const HomePage = () => {
  const { isLoading } = useAuth();
  const [activeCoupons, setActiveCoupons] = useState([]);

  useEffect(() => {
    couponService.getAllActiveCoupons()
      .then(res => setActiveCoupons(res.data))
      .catch(err => console.error("Failed to fetch coupons: ", err));
  }, []);

  const slideImages = [
    "https://plus.unsplash.com/premium_photo-1682310231531-148748e7684f?q=80&w=1212&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=1887&auto=format&fit=crop",
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-24">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary dark:bg-secondary-dark text-text-primary border border-border-color' }} />

      {/* 1. Hero Section with Slideshow */}
      <section className="relative h-[60vh] rounded-xl overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade" loop={true} pagination={{ clickable: true }} autoplay={{ delay: 3000, disableOnInteraction: false }} className="h-full w-full">
            {slideImages.map((img, index) => (
              <SwiperSlide key={index}><div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} /></SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <motion.div className="relative z-20 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.h1 className="text-4xl md:text-6xl font-extrabold text-white" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>Your Health, Delivered.</motion.h1>
          <motion.p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.4 }}>
            Fast, Safe, and Simple. Get medicines from trusted local pharmacies.
          </motion.p>
          <motion.div className="mt-8" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.6 }}>
            <Link to="/shops"><Button className="!text-lg !px-8 !py-3">Browse Shops</Button></Link>
          </motion.div>
        </motion.div>
        <style>{`.swiper-pagination-bullet-active { background-color: #2563EB; }`}</style>
      </section>

      {/* 1.5. Live Coupon Advertisements */}
      {activeCoupons.length > 0 && (
        <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" className="relative">
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
                    <Link to={`/shops/${coupon.shop?._id}`}>
                      <Button className="!py-1 !px-3 !text-xs !rounded-full">Shop Now</Button>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.section>
      )}

      {/* 2. How It Works Section */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-secondary rounded-lg shadow-lg">
            <FaStore className="mx-auto text-primary text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-text-primary">1. Select a Shop</h3>
            <p className="text-text-secondary">Find your favorite local pharmacy to get exactly what you need.</p>
          </div>
          <div className="text-center p-6 bg-secondary rounded-lg shadow-lg">
            <FaSearch className="mx-auto text-primary text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-text-primary">2. Search Medicines</h3>
            <p className="text-text-secondary">Browse products directly from the selected shop's inventory.</p>
          </div>
          <div className="text-center p-6 bg-secondary rounded-lg shadow-lg">
            <FaTruck className="mx-auto text-primary text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-text-primary">3. Fast Delivery</h3>
            <p className="text-text-secondary">Get your order delivered safely to your home.</p>
          </div>
        </div>
      </motion.section>

      {/* 3. Shop from Pharmacies Section */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" className="bg-secondary p-10 rounded-lg text-center flex flex-col items-center shadow-lg">
        <FaStore className="text-5xl text-primary mb-4" />
        <h2 className="text-3xl font-bold text-text-primary">Shop from Pharmacies Near You</h2>
        <p className="mt-2 text-text-secondary max-w-lg">Explore products from verified local pharmacies and get your medicines delivered faster.</p>
        <Link to="/shops" className="mt-6"><Button variant="secondary">View All Pharmacies</Button></Link>
      </motion.section>

      {/* 4. CTA Banner */}
      <motion.section className="bg-primary p-10 rounded-lg text-center" variants={sectionVariants} initial="hidden" whileInView="visible">
        <h2 className="text-3xl font-bold text-white">Are You a Pharmacy Owner?</h2>
        <p className="mt-2 text-blue-100">Join our network and reach more customers in your area.</p>
        <Button variant="secondary" className="mt-6 !bg-white !text-primary hover:!bg-gray-100"> <Link to="/become-a-partner">
          Become a Partner
        </Link></Button>
      </motion.section>

      {/* 5. Testimonials Section */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <blockquote className="text-text-secondary italic">"MediLink is a lifesaver! I got my emergency medicines delivered in under an hour. Highly recommended."</blockquote>
            <p className="mt-4 font-semibold text-text-primary">- Priya Sharma, Ahmedabad</p>
          </div>
          <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <blockquote className="text-text-secondary italic">"The process of uploading a prescription is so simple and the service is incredibly fast. Great platform!"</blockquote>
            <p className="mt-4 font-semibold text-text-primary">- Rohan Mehta, Isanpur</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;