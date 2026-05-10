import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import productService from '../../api/productService';
import { useCategories } from '../../context/CategoryContext';
import ProductCard from '../../components/specific/ProductCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryTreeFilter from '../../components/specific/CategoryTreeFilter';
import { FaBoxOpen, FaChevronRight, FaFilter } from 'react-icons/fa';

const ProductListPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ sort: '', category: '', page: 1, limit: 9 });
  const [isFilterOpen, setIsFilterOpen] = useState(false); // For mobile filter sidebar

  const { data: productsData, loading: productsLoading, error, request: fetchProducts } = useApi(productService.getAllProducts);
  const { allCategories, categoryMap, loading: categoriesLoading } = useCategories();

  // When the URL slug changes, find the corresponding category ID and update the filter
  useEffect(() => {
    const currentCategory = slug ? categoryMap.get(slug) : null;
    setFilters(prev => ({ ...prev, category: currentCategory?._id || '', page: 1 }));
  }, [slug, categoryMap]);

  // This is the single source of truth for fetching products. It runs whenever filters change.
  useEffect(() => {
    const apiFilters = { ...filters };
    if (!apiFilters.category) delete apiFilters.category;
    if (!apiFilters.sort) delete apiFilters.sort;

    fetchProducts(apiFilters);
  }, [filters, fetchProducts]);

  // When a category is clicked in the sidebar, navigate to its URL
  const handleCategorySelect = (categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) {
      navigate(`/medicines/category/${category.slug}`);
    }
    setIsFilterOpen(false); // Close mobile filter after selection
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const currentCategory = categoryMap.get(slug);
  const breadcrumbPath = currentCategory?.breadcrumb || [];
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="container mx-auto">
      {/* --- Breadcrumb Navigation --- */}
      <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
        <Link to="/medicines" className="hover:text-primary">All Categories</Link>
        {breadcrumbPath.map(cat => (
          <React.Fragment key={cat._id}>
            <FaChevronRight size={10} />
            <Link to={`/medicines/category/${cat.slug}`} className="hover:text-primary">{cat.name}</Link>
          </React.Fragment>
        ))}
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary mb-8">{currentCategory?.name || 'All Medicines'}</h1>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button onClick={() => setIsFilterOpen(true)} variant="secondary" className="w-full flex items-center">
          <FaFilter className="mr-2" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* --- Filters Sidebar (Desktop) --- */}
        <aside className="hidden lg:block lg:col-span-1 bg-secondary-dark text-text-primary p-6 rounded-xl shadow-lg h-fit sticky top-24">
          {categoriesLoading ? <Spinner /> : (
            <CategoryTreeFilter
              categories={allCategories}
              onCategorySelect={handleCategorySelect}
              selectedCategory={filters.category}
            />
          )}
        </aside>

        {/* --- Mobile Filter Sidebar --- */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', ease: 'easeOut' }}
              className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-secondary-dark z-50 p-6 overflow-y-auto lg:hidden"
            >
              <h2 className="text-xl font-bold text-primary mb-4">Filters</h2>
              {categoriesLoading ? <Spinner /> : (
                <CategoryTreeFilter categories={allCategories} onCategorySelect={handleCategorySelect} selectedCategory={filters.category} />
              )}
              <Button onClick={() => setIsFilterOpen(false)} className="w-full mt-6">Apply</Button>
            </motion.div>
          )}
        </AnimatePresence>
        {isFilterOpen && <div onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden"></div>}


        {/* --- Products Grid --- */}
        <main className="lg:col-span-3">
          <div className="flex justify-end mb-4">
            <select id="sort" name="sort" onChange={handleFilterChange} value={filters.sort} className="px-3 py-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary text-sm">
              <option value="">Sort by: Default</option>
              <option value="price">Sort by: Price Low to High</option>
              <option value="-price">Sort by: Price High to Low</option>
              <option value="-createdAt">Sort by: Newest</option>
            </select>
          </div>

          {isLoading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}
          {error && <p className="text-center text-red-400">Error: {error}</p>}

          {!isLoading && !error && productsData?.data && (
            productsData.data.length > 0 ? (
              <>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productsData.data.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </motion.div>
                <div className="mt-8 flex justify-center items-center space-x-4">
                  <Button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1}>Previous</Button>
                  <span className="text-text-primary font-semibold">Page {filters.page}</span>
                  <Button onClick={() => handlePageChange(filters.page + 1)} disabled={productsData.data.length < filters.limit}>Next</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-secondary-dark rounded-lg">
                <FaBoxOpen className="mx-auto text-5xl text-text-secondary mb-4" />
                <p className="text-text-secondary">No products found for this category.</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;



