import React, { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import categoryService from '../../api/categoryService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Recursive Component to render the category tree ---
const CategoryTreeItem = ({ category, onEdit, onDelete, onAddSub }) => (
  <div className="my-1 ">
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-primary-dark/50 transition-colors">
      <div className="flex items-center">
        <img src={category.image} alt={category.name} className="w-10 h-10 rounded object-cover mr-3" />
        <span className="text-text-primary">{category.name}</span>
      </div>
      <div className="flex space-x-3 items-center">
        <button onClick={() => onAddSub(category)} className="text-text-secondary hover:text-green-400" title="Add Subcategory"><FaPlus size={12} /></button>
        <button onClick={() => onEdit(category)} className="text-text-secondary hover:text-primary" title="Edit"><FaEdit size={14} /></button>
        <button onClick={() => onDelete(category)} className="text-text-secondary hover:text-red-500" title="Delete"><FaTrash size={13} /></button>
      </div>
    </div>
    {category.children && category.children.length > 0 && (
      <div className="pl-6 border-l border-gray-700 ml-4">
        {category.children.map(child => (
          <CategoryTreeItem key={child._id} category={child} onEdit={onEdit} onDelete={onDelete} onAddSub={onAddSub} />
        ))}
      </div>
    )}
  </div>
);

const ManageCategoriesPage = () => {
  const { data: categoriesData, loading, error, request: fetchCategories } = useApi(categoryService.getAllCategories);

  // State for modal and form management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null); // Category being edited or parent
  const [file, setFile] = useState(null);

  const memoizedFetch = useCallback(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { memoizedFetch(); }, [memoizedFetch]);

  // Helper to create a flat list of categories for the dropdown
  const flattenCategories = (categories, depth = 0) => {
    let flatList = [];
    categories.forEach(cat => {
      flatList.push({ _id: cat._id, name: `${'—'.repeat(depth)} ${cat.name}` });
      if (cat.children && cat.children.length > 0) {
        flatList = flatList.concat(flattenCategories(cat.children, depth + 1));
      }
    });
    return flatList;
  };

  // --- Modal and Action Handlers ---
  const handleOpenAddModal = (parentCategory = null) => {
    setModalMode('add');
    setCurrentCategory({ parent: parentCategory ? parentCategory._id : null, name: '' });
    setFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This might affect products.`)) {
      const promise = categoryService.deleteCategory(category._id).then(() => memoizedFetch());
      toast.promise(promise, {
        loading: 'Deleting category...',
        success: 'Category deleted successfully!',
        error: (err) => err.response?.data?.message || 'Failed to delete.',
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', currentCategory.name);
    if (currentCategory.parent) {
      formData.append('parent', currentCategory.parent);
    }
    if (file) {
      formData.append('image', file);
    }

    if (modalMode === 'add' && !file) {
      toast.error("Please select a category image.");
      return;
    }

    const promise = modalMode === 'add'
      ? categoryService.createCategory(formData)
      : categoryService.updateCategory(currentCategory._id, formData);

    toast.promise(promise.then(() => {
      memoizedFetch();
      setIsModalOpen(false);
    }), {
      loading: `${modalMode === 'add' ? 'Creating' : 'Updating'} category...`,
      success: `Category ${modalMode === 'add' ? 'created' : 'updated'} successfully!`,
      error: (err) => err.response?.data?.message || 'Operation failed.',
    });
  };

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ className: 'bg-secondary-dark text-text-primary border border-gray-700' }} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Manage Categories</h1>
        <Button onClick={() => handleOpenAddModal()}> <FaPlus className="mr-2" /> Add New Category </Button>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && categoriesData?.data && (
        <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
          {categoriesData.data.map(category => (
            <CategoryTreeItem key={category._id} category={category} onEdit={handleOpenEditModal} onDelete={handleDeleteCategory} onAddSub={handleOpenAddModal} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold text-text-primary mb-4 capitalize">{modalMode} Category</h2>
        <form onSubmit={handleFormSubmit}>
          <Input label="Category Name" id="name" type="text" value={currentCategory?.name || ''} onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })} required />
          <div className="mt-4">
            <label htmlFor="image" className="block text-sm font-medium text-text-secondary mb-1">Category Image {modalMode === 'add' && '*'}</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer" />
          </div>
          <div className="mt-4">
            <label htmlFor="parent" className="block text-sm font-medium text-text-secondary mb-1">Parent Category</label>
            <select id="parent" value={currentCategory?.parent || ''} onChange={(e) => setCurrentCategory({ ...currentCategory, parent: e.target.value || null })} className="w-full px-3 py-2 bg-secondary-dark border border-gray-600 rounded-md text-text-primary">
              <option value="">None (Top-level Category)</option>
              {categoriesData?.data && flattenCategories(categoriesData.data).map(cat => (
                <option key={cat._id} value={cat._id} disabled={cat._id === currentCategory?._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCategoriesPage;