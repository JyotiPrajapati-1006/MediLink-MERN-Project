import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import productService from '../../api/productService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import ProductCard from '../../components/specific/ProductCard';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { FaHeart, FaRegHeart, FaShoppingCart, FaChevronRight } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatCurrency';


const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { isItemInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [quantity, setQuantity] = useState("1");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const { data: productData, loading, error, request: fetchProduct } = useApi(productService.getProductById);
  const { data: relatedProductsData, request: fetchRelatedProducts } = useApi(productService.getAllProducts);

  const product = productData?.data;
  const isVariable = product?.variants && product.variants.length > 0;

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
      window.scrollTo(0, 0);
    }
  }, [slug, fetchProduct]);

  useEffect(() => {
    if (product) {

      if (product.category?._id) {
        fetchRelatedProducts({ category: product.category._id, limit: 5 });
      }
      if (isVariable && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product, isVariable, fetchRelatedProducts]);

  const currentPrice = selectedVariant?.price || product?.price;
  const currentMrp = selectedVariant?.mrp || product?.mrp;
  const currentStock = selectedVariant?.countInStock || product?.countInStock;
  const discountPercentage = currentMrp && currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  const isAlreadyInCart = useMemo(() => {
    if (!product) return false;
    return cartItems.some(item =>
      item._id === product._id &&
      (!isVariable || item.variant?._id === selectedVariant?._id)
    );
  }, [cartItems, product, selectedVariant, isVariable]);

  const handleAddToCart = () => {
    if (isAlreadyInCart) { navigate('/cart'); return; }
    if (currentStock === 0) { toast.error("This item is out of stock!"); return; }
    const itemToAdd = isVariable
      ? { ...product, variant: selectedVariant, _id: product._id, name: `${product.name} (${selectedVariant.name})` }
      : { ...product };
    addToCart(itemToAdd, Number(quantity));
    toast.success(`${quantity} x ${itemToAdd.name} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (isItemInWishlist(product._id)) {
      removeFromWishlist(product._id);

      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product._id);
      toast.success('Added to wishlist');
      window.location.reload();
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen-70"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-400">{error}</p>;
  if (!product) return <p className="text-center py-20 text-text-secondary bg-secondary rounded-lg">Product not found.</p>;

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary dark:bg-secondary-dark text-text-primary border border-border-color' }} />

      <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <FaChevronRight size={10} />
        <Link to="/shops" className="hover:text-primary">Shops</Link>
        <FaChevronRight size={10} />
        {product?.shop && (
          <>
            <Link to={`/shops/${product.shop._id}`} className="hover:text-primary">{product.shop.name}</Link>
            <FaChevronRight size={10} />
          </>
        )}
        <span className="text-text-primary font-semibold">{product?.name}</span>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-secondary p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="lg:col-span-2">
          <Swiper
            modules={[Thumbs, Autoplay]}
            spaceBetween={10}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            className="main-product-swiper rounded-lg"
          >
            {product.images.map((img, i) => (
              <SwiperSlide key={i} className="bg-white flex items-center justify-center">
                <img src={img} alt={`${product.name} ${i}`} className="w-full h-80 sm:h-96 object-contain" />
              </SwiperSlide>
            ))}
          </Swiper>
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Thumbs]}
            className="mt-4 thumbs-swiper"
          >
            {product.images.map((img, i) => (
              <SwiperSlide key={i} className="cursor-pointer border-2 border-transparent hover:border-primary rounded-md overflow-hidden">
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-20 object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="lg:col-span-3">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{product.name}</h1>

          </div>
          <p className="text-sm text-text-secondary mt-2">by <Link to={`/shops/${product.shop._id}`} className="text-primary hover:underline">{product.shop.name}</Link></p>

          <div className="my-4 p-4 bg-background rounded-lg ">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-text-primary">{formatCurrency(currentPrice)}</span>
              {discountPercentage > 0 && <span className="text-md text-text-secondary line-through">MRP {formatCurrency(currentMrp)}</span>}
              {discountPercentage > 0 && <span className="text-md font-semibold text-green-500">{discountPercentage}% OFF</span>}
            </div>
            <p className="text-xs text-text-secondary mt-1">Inclusive of all taxes</p>
            {!isVariable && (
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded bg-secondary-dark text-sm font-semibold ${currentStock > 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {currentStock > 0 ? `In Stock (${currentStock})` : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>

          {isVariable && (
            <div className="mb-4">
              <h4 className="text-base font-semibold text-text-primary mb-2">Select Pack Size:</h4>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => {
                  const isOutOfStock = variant.countInStock <= 0;
                  return (
                    <button
                      key={variant._id}
                      onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                      // Disable the button if it's out of stock
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all 
                            ${selectedVariant?._id === variant._id
                          ? 'border-primary bg-primary text-white'
                          : 'border-border-color bg-secondary text-text-primary'}
                            ${isOutOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700'
                          : 'hover:bg-background'}
                        `}
                    >
                      {/* Variant Name */}
                      <span>{variant.name}</span>
                      <div className='border'></div>

                      <span className={`px-4 py-2 rounded-mdtext-sm font-medium transition-all ${selectedVariant?._id === variant._id ? 'border-primary bg-primary text-white' : 'border-border-color bg-secondary text-text-primary hover:bg-background'}`}>{formatCurrency(variant.price)}</span><br></br>
                      {discountPercentage > 0 && <span className="text-md font-semibold text-green-500">{discountPercentage}% OFF</span>} <br />
                      {discountPercentage > 0 && <span className="text-md text-text-secondary line-through">MRP {formatCurrency(variant.mrp)}</span>}


                      {/* --- STOCK INDICATOR ADDED HERE --- */}
                      <span className={`block text-xs mt-1 ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-background p-4 rounded-lg">
            {currentStock > 0 && (
              <div className="flex items-center">
                <label htmlFor="quantity" className="text-sm font-semibold mr-4 ml-4 text-text-secondary">QTY:</label>
                <select id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="p-2  rounded-md mr-4 bg-secondary-dark text-text-primary ">
                  <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                </select>
              </div>
            )}
            <Button onClick={handleAddToCart} className="flex-1 !py-3 font-semibold flex items-center" disabled={currentStock === 0}>
              <FaShoppingCart className="mr-2" />&nbsp;
              {currentStock === 0 ? 'Out of Stock' : (isAlreadyInCart ? 'Go to Cart' : 'Add to Cart')}
            </Button>
            <Button onClick={handleWishlistToggle} variant="secondary" className="px-2 flex-1  flex items-center font-semibold ml-4">
              {isItemInWishlist(product._id) ? <FaHeart className="text-red-500 " /> : <FaRegHeart />} &nbsp;&nbsp; Add to Wishlist
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 bg-secondary p-6 rounded-xl space-y-6">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Product Description</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{product.description}</p>
        </div>
        {product.keyBenefits && <div className="pt-4 border-t border-border-color">
          <h3 className="text-xl font-bold text-text-primary mb-2">Key Benefits</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">{product.keyBenefits.split('|').map((b, i) => <li key={i}>{b.trim()}</li>)}</ul>
        </div>}
        {product.safetyAdvice && <div className="pt-4 border-t border-border-color">
          <h3 className="text-xl font-bold text-text-primary mb-2">Safety Advice</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">{product.safetyAdvice.split('|').map((a, i) => <li key={i}>{a.trim()}</li>)}</ul>
        </div>}
        <div className="pt-4 border-t border-border-color">
          <h3 className="text-xl font-bold text-text-primary mb-2">Other Details</h3>
          <div className="space-y-2 text-sm">
            {product.countryOfOrigin && <p><span className="font-semibold text-text-primary w-36 inline-block">Country of Origin</span>: {product.countryOfOrigin}</p>}
            {product.attributes?.map(attr => <p key={attr.key}><span className="font-semibold text-text-primary w-36 inline-block">{attr.key}</span>: {attr.value}</p>)}
          </div>
        </div>
      </div>

      {relatedProductsData?.data && relatedProductsData.data.length > 1 && (
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-text-primary mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProductsData.data.filter(p => p._id !== product._id).slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;