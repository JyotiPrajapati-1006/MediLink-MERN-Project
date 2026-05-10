import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import shopService from '../../api/shopService';
import productService from '../../api/productService';
import { useCategories } from '../../context/CategoryContext';
import Spinner from '../../components/common/Spinner';
import ProductCard from '../../components/specific/ProductCard';
import CategoryTreeFilter from '../../components/specific/CategoryTreeFilter';
import Button from '../../components/common/Button';
import { FaStar, FaSearch, FaFilter, FaBoxOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ShopDetailsPage = () => {
  const { id: shopId } = useParams();

  // Local state for filters and mobile sidebar
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: shopData, loading: shopLoading, error: shopError, request: fetchShop } = useApi(shopService.getShopById);
  const { data: productsData, loading: productsLoading, error: productsError, request: fetchProducts } = useApi(productService.getProductsByShop);
  const { allCategories, loading: categoriesLoading } = useCategories();

  // Fetch shop details once
  useEffect(() => {
    if (shopId) {
      fetchShop(shopId);
    }
  }, [shopId, fetchShop]);

  // Fetch products whenever shopId or filters change
  useEffect(() => {
    if (shopId) {
      const apiFilters = { ...filters };
      if (!apiFilters.category) delete apiFilters.category;
      if (!apiFilters.search) delete apiFilters.search;
      fetchProducts(shopId, apiFilters);
    }
  }, [shopId, filters, fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleCategorySelect = (categoryId) => {
    // If the same category is clicked, toggle it off
    setFilters(prev => ({ ...prev, category: prev.category === categoryId ? '' : categoryId }));
    setIsFilterOpen(false); // Close mobile filter optionally
  };

  const shop = shopData?.data;
  const products = productsData?.data;
  const isLoading = shopLoading;

  if (isLoading) return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
  if (shopError) return <p className="text-center text-red-400">{shopError}</p>;
  if (!shop) return <p className="text-center text-text-secondary">Shop not found.</p>;

  return (
    <div className="container mx-auto">
      {/* --- Shop Banner Section --- */}
      <div className="relative h-64 rounded-xl overflow-hidden bg-secondary-dark mb-8 shadow-lg">
        <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white w-full">
          <h1 className="text-4xl text-text-primary font-extrabold shadow-sm">{shop.name}</h1>
          <p className="text-gray-900 mt-2 font-medium">{shop.address.street}, {shop.address.city}</p>
          <div className="flex items-center mt-2">
            <FaStar className="text-yellow-400" />
            <span className="ml-1 text-text-primary font-semibold">{shop.rating.toFixed(1)}</span>
            <span className="ml-2 text-gray-600 text-sm">({shop.numReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- Sidebar: Categories --- */}
        <aside className="hidden lg:block lg:col-span-1 bg-secondary-dark text-text-primary p-6 rounded-xl shadow-lg h-fit sticky top-24 border border-border-color">
          <h2 className="text-xl font-bold text-primary mb-4">Categories</h2>
          {categoriesLoading ? <Spinner size="sm" /> : (
            <CategoryTreeFilter
              categories={allCategories}
              onCategorySelect={handleCategorySelect}
              selectedCategory={filters.category}
            />
          )}
        </aside>

        {/* --- Mobile View Filter & Search Bar --- */}
        <main className="lg:col-span-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="w-full md:w-auto lg:hidden">
              <Button onClick={() => setIsFilterOpen(true)} variant="secondary" className="w-full flex justify-center items-center">
                <FaFilter className="mr-2" /> Categories
              </Button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search products in this shop..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-dark border border-gray-600 rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
              />
              <FaSearch className="absolute left-3 top-3.5 text-text-secondary" />
              {filters.search && (
                <button type="button" onClick={() => { setSearchInput(''); setFilters(prev => ({ ...prev, search: '' })) }} className="absolute right-3 top-2.5 text-text-secondary hover:text-red-400 font-bold p-1">
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* --- Products Grid --- */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {filters.search ? `Search results for "${filters.search}"` : `Products from ${shop.name}`}
            </h2>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : productsError ? (
            <p className="text-center text-red-400">{productsError}</p>
          ) : (
            products && products.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-secondary-dark rounded-lg flex flex-col items-center shadow-md">
                <FaBoxOpen className="text-5xl text-primary mb-4" />
                <p className="text-text-secondary text-lg">No products found matching your criteria.</p>
                {(filters.search || filters.category) && (
                  <Button variant="outline" className="mt-4" onClick={() => { setSearchInput(''); setFilters({ search: '', category: '' }); }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )
          )}
        </main>
      </div>

      {/* --- Mobile Filters Sidebar Modal --- */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', ease: 'easeOut' }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-secondary-dark z-50 p-6 overflow-y-auto lg:hidden shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Categories</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-text-secondary hover:text-white font-bold p-2">✕</button>
            </div>
            {categoriesLoading ? <Spinner /> : (
              <CategoryTreeFilter
                categories={allCategories}
                onCategorySelect={handleCategorySelect}
                selectedCategory={filters.category}
              />
            )}
            <Button onClick={() => setIsFilterOpen(false)} className="w-full mt-8">Close Filter</Button>
          </motion.div>
        )}
      </AnimatePresence>
      {isFilterOpen && <div onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"></div>}

    </div>
  );
};

export default ShopDetailsPage;