import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, toggleFeatured } from '../../redux/slices/productSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp, FiEdit, FiTrash2, FiStar, FiEye } from 'react-icons/fi';

const Products = () => {
  const dispatch = useDispatch();
  let { products, isLoading, error, success, message } = useSelector((state) => state.product);
  const {user} = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.category);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
  const [productStats, setProductStats] = useState({
    total: 0,
    featured: 0,
    outOfStock: 0,
    lowStock: 0
  });

  useEffect(() => {
    // Load categories for filter dropdown
    dispatch(fetchCategories());
    
    // Initial products load
    loadProducts();
  }, [dispatch, currentPage, itemsPerPage, sortOption]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [success, message, error]);

  const loadProducts = async () => {
    // Prepare query parameters
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sort: sortOption
    };
    
    // Add filters if set
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (categoryFilter) {
      params.category = categoryFilter;
    }
    
    if (priceFilter.min) {
      params.minPrice = priceFilter.min;
    }
    
    if (priceFilter.max) {
      params.maxPrice = priceFilter.max;
    }
    
    if (stockFilter === 'inStock') {
      params.stockStatus = 'in';
    } else if (stockFilter === 'outOfStock') {
      params.stockStatus = 'out';
    } else if (stockFilter === 'lowStock') {
      params.stockStatus = 'low';
    }
    
    if (featuredFilter) {
      params.isFeatured = featuredFilter === 'featured';
    }
    
    // Dispatch with params
    const result = await dispatch(fetchProducts(params)).unwrap();
    // Update pagination and stats
    if (result && result.pagination) {
      setTotalPages(result.pagination.total);
      
      // Update product stats
      setProductStats({
        total: result?.pagination?.count,
        featured: result?.data?.filter(p => p.isFeatured).length,
        outOfStock: result?.data?.filter(p => p.stockCount === 0).length,
        lowStock: result?.data?.filter(p => p.stockCount > 0 && p.stockCount <= 10).length
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    loadProducts();
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page
    loadProducts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceFilter({ min: '', max: '' });
    setStockFilter('');
    setFeaturedFilter('');
    setSortOption('-createdAt');
    setCurrentPage(1);
    loadProducts();
  };

  const handleDelete = async (id) => {
      setActionLoading(true);
      await dispatch(deleteProduct(id));
      setActionLoading(false);
      loadProducts(); // Refresh the list
  };

  const handleToggleFeatured = async (id) => {
    setActionLoading(true);
    await dispatch(toggleFeatured(id));
    setActionLoading(false);
    loadProducts(); // Refresh the list to update counts
  };

  return (
    <div className="space-y-6">
      {user?.role === 'vendorß' && <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Product
        </Link>
      </div>
      }
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <span className="p-2 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{productStats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Featured Products</h3>
            <span className="p-2 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{productStats.featured}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
            <span className="p-2 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{productStats.outOfStock}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
            <span className="p-2 bg-orange-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <p className="text-2xl font-bold mt-2">{productStats.lowStock}</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-4">
          <form onSubmit={handleSearch} className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button type="submit" className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
          </form>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="mr-1 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <FiChevronUp className="ml-1 h-4 w-4" /> : <FiChevronDown className="ml-1 h-4 w-4" />}
            </button>
            
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-price">Price: High to Low</option>
              <option value="price">Price: Low to High</option>
              <option value="-stockCount">Stock: High to Low</option>
              <option value="stockCount">Stock: Low to High</option>
              <option value="-averageRating">Rating: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md mt-2 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceFilter.min}
                    onChange={(e) => setPriceFilter({ ...priceFilter, min: e.target.value })}
                    className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceFilter.max}
                    onChange={(e) => setPriceFilter({ ...priceFilter, max: e.target.value })}
                    className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="lowStock">Low Stock (&lt;= 10)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Status</label>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="featured">Featured</option>
                  <option value="notFeatured">Not Featured</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex items-end">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleFilterChange}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products && products?.data?.length > 0 ? (
                  products.data.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={product.images[0].url} 
                                alt={product.name} 
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md mr-4"></div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category ? product.category.name : 'Uncategorized'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price?.toFixed(2) || '0.00'}</div>
                        {product.discountPercentage > 0 && (
                          <div className="text-xs text-green-600">{product.discountPercentage}% off</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stockCount > 20 ? 'bg-green-100 text-green-800' : 
                          product.stockCount > 10 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stockCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          disabled={actionLoading}
                          className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            product.isFeatured ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <FiStar className={`mr-1 h-3 w-3 ${product.isFeatured ? 'fill-current' : ''}`} />
                          {product.isFeatured ? 'Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/admin/products/${product._id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <FiEye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <button 
                            className="text-red-600 hover:text-red-900 flex items-center"
                            onClick={() => handleDelete(product._id)}
                            disabled={actionLoading}
                          >
                            <FiTrash2 className="h-4 w-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-md">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, productStats.total)}
                  </span>{' '}
                  of <span className="font-medium">{productStats.total}</span> products
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products; 