import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';

// This is a recursive component that calls itself to render children
const CategoryNode = ({ category, onCategorySelect, selectedCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const isSelected = selectedCategory === category._id;

  return (
    <li className="my-1">
      <div
        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-primary text-white' : 'hover:bg-primary-dark/50'}`}
        onClick={() => onCategorySelect(category._id)}
      >
        <span className="text-sm">{category.name}</span>
        {hasChildren && (
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
            <FaChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} size={16} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.ul
            className="pl-4 border-l border-gray-700 ml-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {category.children.map(child => (
              <CategoryNode
                key={child._id}
                category={child}
                onCategorySelect={onCategorySelect}
                selectedCategory={selectedCategory}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

const CategoryTreeFilter = ({ categories, onCategorySelect, selectedCategory }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Categories</h3>
      <ul>
        {categories.map(category => (
          <CategoryNode
            key={category._id}
            category={category}
            onCategorySelect={onCategorySelect}
            selectedCategory={selectedCategory}
          />
        ))}
      </ul>
    </div>
  );
};

export default CategoryTreeFilter;