import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  createCategory, 
  updateCategory, 
  fetchCategories 
} from '../../redux/slices/categorySlice';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';

const CategoryForm = ({ category = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.category);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    order: 0,
    isActive: true,
    featured: false,
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Fetch categories for parent dropdown
    dispatch(fetchCategories());
    
    // If editing an existing category, populate the form
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent: category.parent?._id || '',
        order: category.order || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
        featured: category.featured || false
      });
      
      if (category.image && category.image.url) {
        setImagePreview(category.image.url);
      }
    }
  }, [dispatch, category]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (formData.order && isNaN(Number(formData.order))) {
      newErrors.order = 'Order must be a number';
    }
    
    // If we're editing and trying to set this category as its own parent
    if (category && formData.parent === category._id) {
      newErrors.parent = 'A category cannot be its own parent';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create FormData object for file upload
    const submitData = new FormData();
    for (const key in formData) {
      if (key === 'image' && formData[key] === null) {
        // Skip null image
        continue;
      }
      submitData.append(key, formData[key]);
    }
    
    try {
      if (category) {
        // Update existing category
        await dispatch(updateCategory({ 
          id: category._id, 
          categoryData: submitData 
        })).unwrap();
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await dispatch(createCategory(submitData)).unwrap();
        toast.success('Category created successfully');
        
        // Reset form after creating
        setFormData({
          name: '',
          description: '',
          parent: '',
          order: 0,
          isActive: true,
          featured: false,
          image: null
        });
        setImagePreview(null);
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Error saving category');
    }
  };
  
  // Filter out the current category and its children from parent options
  const parentOptions = categories.filter(cat => {
    if (!category) return true;
    return cat._id !== category._id;
  });
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          <select
            name="parent"
            value={formData.parent}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.parent ? 'border-red-500' : ''
            }`}
          >
            <option value="">None (Top Level Category)</option>
            {parentOptions.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.parent && (
            <p className="mt-1 text-sm text-red-600">{errors.parent}</p>
          )}
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.order ? 'border-red-500' : ''
            }`}
          />
          {errors.order && (
            <p className="mt-1 text-sm text-red-600">{errors.order}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers appear first in navigation
          </p>
        </div>
        
        <div className="flex flex-col justify-end">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Featured
              </label>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Category Image
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Category"
                  className="max-h-64 max-w-full rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 