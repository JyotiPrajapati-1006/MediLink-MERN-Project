import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import productService from '../../api/productService';
import categoryService from '../../api/categoryService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../../components/common/Spinner';
import { FaPlus, FaTrash } from 'react-icons/fa';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-secondary-dark p-6 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ProductFormModal = ({ isOpen, onClose, mode, product, onSave }) => {
  // --- State Management ---
  const [formData, setFormData] = useState({ name: '', brand: '', description: '', category: '', requiresPrescription: false, keyBenefits: '', safetyAdvice: '', countryOfOrigin: 'India' });
  const [productType, setProductType] = useState('simple');
  const [simpleProductData, setSimpleProductData] = useState({ price: '', mrp: '', countInStock: '' });
  const [variants, setVariants] = useState([{ name: '', price: '', mrp: '', countInStock: '' }]);
  const [attributes, setAttributes] = useState([{ key: 'Consume Type', value: 'Oral' }]);

  const [categories, setCategories] = useState([]);
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const { request: fetchCategories } = useApi(categoryService.getAllCategories);
  const { loading, request: submitProduct } = useApi(mode === 'add' ? productService.createProduct : productService.updateProduct);

  useEffect(() => {
    if (isOpen) {
      fetchCategories().then(res => setCategories(res.data || []));
      if (mode === 'edit' && product) {
        setFormData({ name: product.name, brand: product.brand, description: product.description, category: product.category, requiresPrescription: product.requiresPrescription, keyBenefits: product.keyBenefits || '', safetyAdvice: product.safetyAdvice || '', countryOfOrigin: product.countryOfOrigin || 'India' });
        if (product.variants && product.variants.length > 0) {
          setProductType('variable');
          // Map variants to ensure none have negative stock
          setVariants(product.variants.map(v => ({
            ...v, 
            countInStock: Math.max(0, v.countInStock || 0)
          })));
        } else {
          setProductType('simple');
          setSimpleProductData({ 
            price: product.price || '', 
            mrp: product.mrp || '', 
            countInStock: Math.max(0, product.countInStock || 0) 
          });
        }
        setAttributes(product.attributes && product.attributes.length > 0 ? product.attributes : [{ key: 'Consume Type', value: 'Oral' }]);
        setPreviews(product.images || []);
      } else {
        setFormData({ name: '', brand: '', description: '', category: '', requiresPrescription: false, keyBenefits: '', safetyAdvice: '', countryOfOrigin: 'India' });
        setProductType('simple');
        setSimpleProductData({ price: '', mrp: '', countInStock: '' });
        setVariants([{ name: '', price: '', mrp: '', countInStock: '' }]);
        setAttributes([{ key: 'Consume Type', value: 'Oral' }, { key: 'Return Policy', value: 'Not Returnable' }]);
        setPreviews([]); setFiles([]); setSelectedLevel1(''); setSelectedLevel2('');
      }
    }
  }, [isOpen, mode, product, fetchCategories]);

  // --- All Handlers ---
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    setFiles(selectedFiles);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };
  const handleVariantChange = (index, e) => {
    const newVariants = [...variants];
    newVariants[index][e.target.name] = e.target.value;
    setVariants(newVariants);
  };
  const addVariant = () => setVariants([...variants, { name: '', price: '', mrp: '', countInStock: '' }]);
  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));
  const handleAttributeChange = (index, e) => {
    const newAttributes = [...attributes];
    newAttributes[index][e.target.name] = e.target.value;
    setAttributes(newAttributes);
  };
  const addAttribute = () => setAttributes([...attributes, { key: '', value: '' }]);
  const removeAttribute = (index) => setAttributes(attributes.filter((_, i) => i !== index));
  const handleCategoryChange = (level, value) => {
    if (level === 1) { setSelectedLevel1(value); setSelectedLevel2(''); setFormData(prev => ({ ...prev, category: value })); }
    else if (level === 2) { setSelectedLevel2(value); setFormData(prev => ({ ...prev, category: value })); }
    else { setFormData(prev => ({ ...prev, category: value })); }
  };
  const subCategories = categories.find(cat => cat._id === selectedLevel1)?.children || [];
  const subSubCategories = subCategories.find(cat => cat._id === selectedLevel2)?.children || [];

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error("Please select a category.");

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));

    if (productType === 'simple') {
      submissionData.append('price', simpleProductData.price);
      if (simpleProductData.mrp) submissionData.append('mrp', simpleProductData.mrp);
      submissionData.append('countInStock', simpleProductData.countInStock);
    } else {
      submissionData.append('variants', JSON.stringify(variants));
    }
    submissionData.append('attributes', JSON.stringify(attributes));
    if (files.length > 0) files.forEach(file => submissionData.append('images', file));
    else if (mode === 'add') return toast.error("Please upload at least one image.");

    const promise = mode === 'add' ? submitProduct(submissionData) : submitProduct(product._id, submissionData);
    try {
      await toast.promise(promise, { loading: 'Saving...', success: `Product ${mode}ed!`, error: 'Failed.' });
      onSave(); onClose();
    } catch (error) { }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold text-text-primary mb-6 capitalize">{mode} Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="p-4 bg-primary-dark/30 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Product Name" value={formData.name} onChange={handleChange} required />
            <Input name="brand" label="Brand/Manufacturer" value={formData.brand} onChange={handleChange} required />
          </div>
        </div>

        <div className="p-4 bg-primary-dark/30 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Pricing & Inventory</h3>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer"><input type="radio" name="productType" value="simple" checked={productType === 'simple'} onChange={(e) => setProductType(e.target.value)} className="mr-2 h-4 w-4 text-primary" /> Simple Product</label>
            <label className="flex items-center cursor-pointer"><input type="radio" name="productType" value="variable" checked={productType === 'variable'} onChange={(e) => setProductType(e.target.value)} className="mr-2 h-4 w-4 text-primary" /> Variable Product</label>
          </div>
          {productType === 'simple' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Price (₹)" type="number" min="0" value={simpleProductData.price} onChange={(e) => setSimpleProductData({ ...simpleProductData, price: e.target.value })} required />
              <Input label="MRP (Optional)" type="number" min="0" value={simpleProductData.mrp} onChange={(e) => setSimpleProductData({ ...simpleProductData, mrp: e.target.value })} />
              <Input label="Stock" type="number" min="0" value={simpleProductData.countInStock} onChange={(e) => setSimpleProductData({ ...simpleProductData, countInStock: e.target.value })} required />
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-10 gap-2 items-end">
                  <Input name="name" placeholder="Variant (e.g., 500ml)" value={v.name} onChange={(e) => handleVariantChange(i, e)} className="col-span-3" />
                  <Input name="price" placeholder="Price" type="number" min="0" value={v.price} onChange={(e) => handleVariantChange(i, e)} className="col-span-2" />
                  <Input name="mrp" placeholder="MRP" type="number" min="0" value={v.mrp} onChange={(e) => handleVariantChange(i, e)} className="col-span-2" />
                  <Input name="countInStock" placeholder="Stock" type="number" min="0" value={v.countInStock} onChange={(e) => handleVariantChange(i, e)} className="col-span-2" />
                  <Button type="button" variant="danger" onClick={() => removeVariant(i)} className="!py-2.5 col-span-1"><FaTrash /></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addVariant}><FaPlus className="mr-2" />Add Variant</Button>
            </div>
          )}
        </div>

        <div className="p-4 bg-primary-dark/30 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Categorization & Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select onChange={(e) => handleCategoryChange(1, e.target.value)} value={selectedLevel1} className="w-full p-2.5 bg-secondary-dark border border-gray-600 rounded-md">
              <option value="">Main Category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
            {subCategories.length > 0 && <select onChange={(e) => handleCategoryChange(2, e.target.value)} value={selectedLevel2} className="w-full p-2.5 bg-secondary-dark border border-gray-600 rounded-md">
              <option value={selectedLevel1}>Subcategory (Optional)</option>
              {subCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>}
            {subSubCategories.length > 0 && <select onChange={(e) => handleCategoryChange(3, e.target.value)} value={formData.category} className="w-full p-2.5 bg-secondary-dark border border-gray-600 rounded-md">
              <option value={selectedLevel2}>Sub-Subcategory (Optional)</option>
              {subSubCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md"></textarea>
          </div>
          <div>
            <label htmlFor="keyBenefits" className="block text-sm font-medium text-text-primary mb-1">Key Benefits (Use '|' to separate points)</label>
            <textarea name="keyBenefits" value={formData.keyBenefits} onChange={handleChange} rows="3" className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md"></textarea>
          </div>
          <div>
            <label htmlFor="safetyAdvice" className="block text-sm font-medium text-text-primary mb-1">Safety Advice (Use '|' to separate points)</label>
            <textarea name="safetyAdvice" value={formData.safetyAdvice} onChange={handleChange} rows="3" className="w-full p-2 bg-secondary-dark border border-gray-600 rounded-md"></textarea>
          </div>
          <Input name="countryOfOrigin" label="Country of Origin" value={formData.countryOfOrigin} onChange={handleChange} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Product Images (Max 5)</label>
            <input type="file" multiple name="images" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700" />
            {(previews.length > 0) && <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">{previews.map((src, i) => <img key={i} src={src} alt="preview" className="w-24 h-24 rounded-md object-cover border-2 border-gray-600" />)}</div>}
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="requiresPrescription" name="requiresPrescription" checked={formData.requiresPrescription} onChange={handleChange} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary" />
            <label htmlFor="requiresPrescription" className="ml-2 text-sm text-text-primary cursor-pointer">Requires Prescription?</label>
          </div>
        </div>

        <div className="p-4 bg-primary-dark/30 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Additional Attributes</h3>
          {attributes.map((attr, index) => (
            <div key={index} className="grid grid-cols-10 gap-2 items-end">
              <Input name="key" placeholder="Attribute Name (e.g., Form)" value={attr.key} onChange={(e) => handleAttributeChange(index, e)} className="col-span-4" />
              <Input name="value" placeholder="Attribute Value (e.g., Tablet)" value={attr.value} onChange={(e) => handleAttributeChange(index, e)} className="col-span-5" />
              <Button type="button" variant="danger" onClick={() => removeAttribute(index)} className="!py-2.5 col-span-1"><FaTrash /></Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addAttribute}><FaPlus className="mr-2" />Add Attribute</Button>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Save Product'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;