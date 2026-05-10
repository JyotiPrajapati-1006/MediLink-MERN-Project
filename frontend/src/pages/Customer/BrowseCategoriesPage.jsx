import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import categoryService from '../../api/categoryService';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';

// --- Reusable Category Card Component ---
const CategoryCard = ({ category }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-secondary-dark rounded-lg overflow-hidden border border-gray-700/50 group"
  >
    <Link to={`/medicines/category/${category.slug}`} className="block">
      <div className="relative h-40">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-text-primary text-center group-hover:text-primary transition-colors">{category.name}</h3>
      </div>
    </Link>
  </motion.div>
);

const BrowseCategoriesPage = () => {
  const { data: categoriesData, loading, error, request: fetchCategories } = useApi(categoryService.getAllCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>;

  // We only want to show top-level categories on this page
  const topLevelCategories = categoriesData?.data?.filter(cat => !cat.parent) || [];

  return (
    <div className="container mx-auto">
      <motion.h1
        className="text-4xl font-extrabold text-text-primary mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Browse Medicines by Category
      </motion.h1>

      {topLevelCategories.length > 0 ? (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {topLevelCategories.map(category => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-secondary-dark rounded-lg">
          <p className="text-text-secondary">No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseCategoriesPage;