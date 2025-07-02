import { useState, useEffect } from 'react';
import categoryService from '../../api/categoryService';

const ProductFilter = ({ initialFilters = {}, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    subCategory: initialFilters.subCategory || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || '-createdAt',
    ...initialFilters
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Update state
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
    
    // For most filters, apply immediately
    if (name !== 'minPrice' && name !== 'maxPrice') {
      onFilterChange({
        ...filters,
        [name]: value
      });
    }
  };

  // Handle price range input
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleFilterChange(e);
    }
  };

  // Apply price filter
  const applyPriceFilter = () => {
    onFilterChange(filters);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const defaultFilters = {
      category: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
      sort: '-createdAt'
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Products</h2>
      
      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <input
                type="text"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handlePriceChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <input
                type="text"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handlePriceChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-indigo-100 text-indigo-700 py-1 px-4 rounded-md hover:bg-indigo-200 transition-colors text-sm"
          >
            Apply Price Filter
          </button>
        </div>
        
        {/* Sort Filter */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-averageRating">Highest Rated</option>
            <option value="-numReviews">Most Reviewed</option>
          </select>
        </div>
        
        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="w-full mt-4 bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter; 