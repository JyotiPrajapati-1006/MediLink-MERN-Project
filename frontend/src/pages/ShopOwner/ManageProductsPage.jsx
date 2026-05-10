import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import productService from '../../api/productService';
import categoryService from '../../api/categoryService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBoxOpen, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ProductFormModal from './ProductFormModal';

// --- Reusable Cards for Categories and Products ---
const CategoryCard = ({ category, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-secondary-dark p-4 rounded-lg border border-gray-700/50 cursor-pointer text-center"
    onClick={() => onClick(category)}
  >
    <img src={category.image} alt={category.name} className="w-24 h-24 mx-auto rounded-full object-cover mb-3 border-2 border-gray-600" />
    <h3 className="font-bold text-text-primary text-sm">{category.name}</h3>
  </motion.div>
);

const ProductListItem = ({ product, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVariable = product.variants && product.variants.length > 0;

  // Calculate price range and total stock for variable products
  const variantInfo = useMemo(() => {
    if (!isVariable) return null;
    const prices = product.variants.map(v => v.price);
    const stock = product.variants.reduce((acc, v) => acc + v.countInStock, 0);
    return {
      priceRange: `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`,
      totalStock: stock,
    };
  }, [product, isVariable]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-secondary-dark p-4 rounded-lg border border-gray-700/50"
    >
      <div className="flex items-center">
        <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-md object-cover mr-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary truncate">{product.name}</h3>
          <p className="text-sm text-text-secondary">{product.brand}</p>
          <div className="flex items-center space-x-4 mt-1">
            {isVariable ? (
              <>
                <span className="text-sm font-semibold text-primary">{variantInfo.priceRange}</span>
                <span className="text-xs text-text-secondary">Total Stock: {variantInfo.totalStock}</span>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-blue-400 flex items-center">
                  View Variants <FaChevronDown className={`ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-primary">{`₹${product.price}`}</span>
                <span className="text-xs text-text-secondary">
                  Stock: {product.countInStock > 0 ? (
                    product.countInStock
                  ) : (
                    <span className="text-red-500 font-bold ml-1">0 (Out of Stock)</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3 ml-4">
          <button onClick={() => onEdit(product)} className="text-text-secondary hover:text-primary p-2"><FaEdit /></button>
          <button onClick={() => onDelete(product)} className="text-text-secondary hover:text-red-500 p-2"><FaTrash /></button>
        </div>
      </div>
      <AnimatePresence>
        {isVariable && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-xs">
              {product.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 text-text-secondary">
                  <span>{variant.name}</span>
                  <span className="font-semibold text-text-primary">₹{variant.price}</span>
                  <span>
                    Stock: {variant.countInStock > 0 ? (
                      variant.countInStock
                    ) : (
                      <span className="text-red-500 font-bold ml-1">0 (Out of Stock)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ManageProductsPage = () => {
  // API Hooks
  const { data: productsData, loading: productsLoading, request: fetchProducts, setData } = useApi(productService.getMyShopProducts);
  const { data: categoriesData, loading: categoriesLoading, request: fetchCategories } = useApi(categoryService.getAllCategories);

  // State Management
  const [view, setView] = useState('categories'); // 'categories' or 'products'
  const [categoryPath, setCategoryPath] = useState([]); // Array of category objects
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Initial data fetching
  const memoizedFetchProducts = useCallback(() => { fetchProducts(); }, [fetchProducts]);
  const memoizedFetchCategories = useCallback(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    memoizedFetchProducts();
    memoizedFetchCategories();
  }, [memoizedFetchProducts, memoizedFetchCategories]);

  // --- Derived State and Logic ---
  const currentCategory = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
  const itemsToShow = useMemo(() => {
    if (!currentCategory) return categoriesData?.data || [];
    return currentCategory.children || [];
  }, [currentCategory, categoriesData]);

  const productsToShow = useMemo(() => {
    if (view !== 'products' || !productsData?.data) return [];
    return productsData.data.filter(p => p.category === currentCategory?._id);
  }, [view, productsData, currentCategory]);

  // --- Handlers ---
  const handleCategoryClick = (category) => {
    setCategoryPath([...categoryPath, category]);
    if (!category.children || category.children.length === 0) {
      setView('products');
    }
  };

  const handleBreadcrumbClick = (index) => {
    setCategoryPath(categoryPath.slice(0, index + 1));
    setView('categories');
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-4">
        <p>Delete "{product.name}"?</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => { toast.dismiss(t.id); confirmDelete(product._id); }}>Confirm</Button>
          <Button variant="secondary" onClick={() => toast.dismiss(t.id)}>Cancel</Button>
        </div>
      </div>
    ));
  };

  const confirmDelete = (productId) => {
    const promise = productService.deleteProduct(productId).then(() => {
      setData(prev => ({ ...prev, data: prev.data.filter(p => p._id !== productId) }));
    });
    toast.promise(promise, { loading: 'Deleting...', success: 'Product deleted!', error: 'Failed to delete.' });
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Manage Products</h1>
        <Button onClick={handleOpenAddModal}><FaPlus className="mr-2" /> Add Product</Button>
      </div>

      <div className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
        <button onClick={() => { setCategoryPath([]); setView('categories'); }} className="hover:text-primary">All Categories</button>
        {categoryPath.map((cat, index) => (
          <React.Fragment key={cat._id}>
            <FaChevronRight size={12} />
            <button onClick={() => handleBreadcrumbClick(index)} className="hover:text-primary">{cat.name}</button>
          </React.Fragment>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {!isLoading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (currentCategory?._id || 'root')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {view === 'categories' ? (
              itemsToShow.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {itemsToShow.map(category => (
                    <CategoryCard key={category._id} category={category} onClick={handleCategoryClick} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary-dark rounded-lg">
                  <p className="text-text-secondary">No sub-categories found. You can add products to "{currentCategory?.name}".</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {productsToShow.length > 0 ? (
                  productsToShow.map((product) => (
                    <ProductListItem key={product._id} product={product} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-secondary-dark rounded-lg">
                    <FaBoxOpen className="mx-auto text-5xl text-text-secondary mb-4" />
                    <p className="text-text-secondary">No products found in this category.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        product={selectedProduct}
        onSave={memoizedFetchProducts}
        initialCategory={currentCategory} // Pass the currently viewed category to the modal
      />
    </div>
  );
};

export default ManageProductsPage;