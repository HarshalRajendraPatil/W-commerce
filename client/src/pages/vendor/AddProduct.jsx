import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../redux/slices/vendorProductsSlice';
import { toast } from 'react-toastify';
import categoryService from '../../api/categoryService';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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
  
  // Category state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    
    fetchCategories();
  }, []);
  
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
    
    // Clear previous images if needed
    if (e.target.files.length > 0) {
      setImages(files);
      
      // Create image previews
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview(previews);
      
      // Reset alt text array to match new images length
      const newAlts = Array(files.length).fill('');
      setFormData({ ...formData, imagesAlt: newAlts });
    }
  };
  
  // Set primary image
  const setPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
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
      
      // Add images to FormData with their alt text
      images.forEach((image, index) => {
        productData.append('images', image);
        productData.append(`imageAlt_${index}`, formData.imagesAlt[index] || '');
      });
      
      // Set primary image index
      productData.append('primaryImageIndex', primaryImageIndex.toString());
      
      // Dispatch action to create product
      const resultAction = await dispatch(createProduct(productData));
      
      if (createProduct.fulfilled.match(resultAction)) {
        toast.success('Product created successfully!');
        navigate('/vendor/products');
      } else {
        throw new Error(resultAction.payload?.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
      toast.error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images* (Click on an image to set as primary)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagePreview.map((src, index) => (
                  <div 
                    key={index} 
                    className={`relative cursor-pointer border-2 rounded-md ${index === primaryImageIndex ? 'border-green-500' : 'border-transparent'}`}
                    onClick={() => setPrimaryImage(index)}
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    {index === primaryImageIndex && (
                      <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {images.map((_, index) => (
              <div key={index} className="mt-2">
                <label className="text-sm text-gray-600">Alt text for Image {index + 1}</label>
                <input
                  type="text"
                  placeholder="Alt text"
                  value={formData.imagesAlt?.[index] || ''}
                  onChange={(e) => {
                    const updatedAlts = [...(formData.imagesAlt || [])];
                    updatedAlts[index] = e.target.value;
                    setFormData({ ...formData, imagesAlt: updatedAlts });
                  }}
                  className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1"
                />
              </div>
            ))}
            
            <p className="mt-2 text-sm text-gray-500">
              You can upload multiple images (max 5MB each). Click on an image to set it as primary.
            </p>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Variants</h2>
          {formData.variants.map((variant, vIndex) => (
            <div key={vIndex} className="mb-6">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[vIndex].name = e.target.value;
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  placeholder="Variant Name (e.g. Color)"
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = formData.variants.filter((_, i) => i !== vIndex);
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  className="bg-red-500 text-white px-3 py-2 rounded-md"
                >
                  ✕
                </button>
              </div>

              {variant.options.map((opt, oIndex) => (
                <div key={oIndex} className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[vIndex].options[oIndex].value = e.target.value;
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    placeholder="Option (e.g. Red)"
                    className="border rounded-md px-2 py-1"
                  />
                  <input
                    type="number"
                    value={opt.priceModifier}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[vIndex].options[oIndex].priceModifier = parseFloat(e.target.value);
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    placeholder="Price Modifier"
                    className="border rounded-md px-2 py-1"
                  />
                  <input
                    type="number"
                    value={opt.stockCount}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[vIndex].options[oIndex].stockCount = parseInt(e.target.value);
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    placeholder="Stock"
                    className="border rounded-md px-2 py-1"
                  />
                  <input
                    type="text"
                    value={opt.sku}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[vIndex].options[oIndex].sku = e.target.value;
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    placeholder="SKU"
                    className="border rounded-md px-2 py-1"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newVariants = [...formData.variants];
                  newVariants[vIndex].options.push({
                    value: '',
                    priceModifier: 0,
                    stockCount: 0,
                    sku: ''
                  });
                  setFormData({ ...formData, variants: newVariants });
                }}
                className="text-sm bg-indigo-100 px-2 py-1 rounded"
              >
                + Add Option
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                variants: [
                  ...formData.variants,
                  {
                    name: '',
                    options: [
                      {
                        value: '',
                        priceModifier: 0,
                        stockCount: 0,
                        sku: ''
                      }
                    ]
                  }
                ]
              });
            }}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            + Add Variant
          </button>
        </div>
        
        {/* Specifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Specifications</h2>
          {formData.specifications.map((spec, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name="name"
                value={spec.name}
                onChange={(e) => handleSpecChange(index, e)}
                placeholder="Name (e.g. Color)"
                className="w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                name="value"
                value={spec.value}
                onChange={(e) => handleSpecChange(index, e)}
                placeholder="Value (e.g. Red)"
                className="w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpecification}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Add Specification
          </button>
        </div>
        
        {/* Tags */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Tags</h2>
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                placeholder="Tag (e.g. electronics)"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addTag}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Add Tag
          </button>
        </div>
        
        {/* Publication */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Publication</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish this product (will be immediately visible in the store)
            </label>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vendor/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct; 