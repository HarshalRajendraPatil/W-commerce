import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateProduct } from '../../redux/slices/vendorProductsSlice';
import { toast } from 'react-toastify';
import categoryService from '../../api/categoryService';
import { vendorApi } from '../../api/vendorApi';
import Loader from '../../components/common/Loader';

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();

  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockCount: '',
    brand: '',
    discountPercentage: '0',
    specifications: [{ name: '', value: '' }],
    variants: [
      {
        name: '',
        options: [{ value: '', priceModifier: 0, stockCount: 0, sku: '' }]
      }
    ],
    tags: [''],
    published: false,
    imagesAlt: []
  });
  
  // Image state
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  // Category state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load product data and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product data
        const productResponse = await vendorApi.getProductById(productId);
        const product = productResponse.data.data;
        
        // Fetch categories
        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse.data);
        
        // Set form data
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category?._id || '',
          stockCount: product.stockCount || '',
          brand: product.brand || '',
          discountPercentage: product.discountPercentage || '0',
          specifications: product.specifications?.length > 0 
            ? product.specifications 
            : [{ name: '', value: '' }],
          variants: product.variants?.length > 0 
            ? product.variants 
            : [{ name: '', options: [{ value: '', priceModifier: 0, stockCount: 0, sku: '' }] }],
          tags: product.tags?.length > 0 ? product.tags : [''],
          published: product.published || false,
          imagesAlt: product.images?.map(img => img.alt || '') || []
        });
        
        // Set existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
          
          // Find primary image index
          const primaryIndex = product.images.findIndex(img => img.isPrimary);
          if (primaryIndex !== -1) {
            setPrimaryImageIndex(primaryIndex);
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product data. Please try again later.');
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle specification changes
  const handleSpecChange = (index, e) => {
    const { name, value } = e.target;
    const newSpecs = [...formData.specifications];
    newSpecs[index][name] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };
  
  // Add new specification field
  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: '', value: '' }]
    });
  };
  
  // Remove specification field
  const removeSpecification = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData({ ...formData, specifications: newSpecs });
  };
  
  // Handle tag changes
  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };
  
  // Add new tag field
  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };
  
  // Remove tag field
  const removeTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };
  
  // Handle image changes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      setImages(files);
      
      // Create image previews
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview(previews);
      
      // Add alt text fields for new images
      const currentAlts = [...formData.imagesAlt];
      const newAlts = [...currentAlts, ...Array(files.length).fill('')];
      setFormData({ ...formData, imagesAlt: newAlts });
    }
  };
  
  // Set primary image
  const setPrimaryImage = (index, isExisting = false) => {
    if (isExisting) {
      setPrimaryImageIndex(index);
    } else {
      setPrimaryImageIndex(existingImages.length + index);
    }
  };
  
  // Handle removing existing image
  const handleRemoveExistingImage = (index) => {
    // Add image ID to the list of images to delete
    setImagesToDelete([...imagesToDelete, existingImages[index]._id]);
    
    // Remove from existing images
    const updatedExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedExistingImages);
    
    // Update alt texts
    const updatedAlts = [...formData.imagesAlt];
    updatedAlts.splice(index, 1);
    setFormData({ ...formData, imagesAlt: updatedAlts });
    
    // Update primary image index if needed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object
      const productData = new FormData();
      
      // Add form data to FormData
      Object.keys(formData).forEach(key => {
        if (['specifications', 'tags', 'variants'].includes(key)) {
          productData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'imagesAlt') { // Don't append imagesAlt directly
          productData.append(key, formData[key]);
        }
      });
      
      // Add existing images data
      productData.append('existingImages', JSON.stringify(existingImages.map((img, index) => ({
        _id: img._id,
        alt: formData.imagesAlt[index] || '',
        isPrimary: index === primaryImageIndex
      }))));
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        productData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      // Add new images to FormData with their alt text
      images.forEach((image, index) => {
        productData.append('newImages', image);
        productData.append(`imageAlt_${index}`, formData.imagesAlt[existingImages.length + index] || '');
      });
      
      // Set primary image index
      productData.append('primaryImageIndex', primaryImageIndex.toString());
      
      // Dispatch action to update product
      const resultAction = await dispatch(updateProduct({id: productId, productData }));
      
      if (updateProduct.fulfilled.match(resultAction)) {
        toast.success('Product updated successfully!');
        navigate('/vendor/products');
      } else {
        throw new Error(resultAction.payload?.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product. Please try again.');
      toast.error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Count*
              </label>
              <input
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Published</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
        </div>
        
        {/* Images */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Product Images</h2>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Existing Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingImages.map((image, index) => (
                  <div 
                    key={image._id} 
                    className={`relative cursor-pointer border-2 rounded-md ${primaryImageIndex === index ? 'border-green-500' : 'border-transparent'}`}
                    onClick={() => setPrimaryImage(index, true)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    {primaryImageIndex === index && (
                      <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExistingImage(index);
                      }}
                      className="absolute top-0 left-0 bg-red-500 text-white rounded-br p-1 text-xs"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={formData.imagesAlt[index] || ''}
                      onChange={(e) => {
                        const updatedAlts = [...formData.imagesAlt];
                        updatedAlts[index] = e.target.value;
                        setFormData({ ...formData, imagesAlt: updatedAlts });
                      }}
                      className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Images */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload New Images (Click on an image to set as primary)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreview.map((src, index) => (
                  <div 
                    key={index} 
                    className={`relative cursor-pointer border-2 rounded-md ${primaryImageIndex === existingImages.length + index ? 'border-green-500' : 'border-transparent'}`}
                    onClick={() => setPrimaryImage(index)}
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    {primaryImageIndex === existingImages.length + index && (
                      <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl">
                        Primary
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={formData.imagesAlt[existingImages.length + index] || ''}
                      onChange={(e) => {
                        const updatedAlts = [...formData.imagesAlt];
                        updatedAlts[existingImages.length + index] = e.target.value;
                        setFormData({ ...formData, imagesAlt: updatedAlts });
                      }}
                      className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Specifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Specifications</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Add Specification
            </button>
          </div>
          
          {formData.specifications.map((spec, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name="name"
                value={spec.name}
                onChange={(e) => handleSpecChange(index, e)}
                placeholder="Name (e.g. Weight)"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
              <input
                type="text"
                name="value"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, e)}
                placeholder="Value (e.g. 2.5 kg)"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="bg-red-500 text-white px-3 py-2 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        {/* Tags */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Tags</h2>
            <button
              type="button"
              onClick={addTag}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Add Tag
            </button>
          </div>
          
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder="Tag"
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="bg-red-500 text-white px-3 py-2 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct; 