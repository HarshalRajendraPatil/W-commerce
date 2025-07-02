import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../../api/productService';
import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';
import Pagination from '../../components/common/Pagination';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  });
  
  // Get filters from URL search params
  const getFiltersFromUrl = () => {
    const filters = {};
    
    for (const [key, value] of searchParams.entries()) {
      filters[key] = value;
    }
    
    return filters;
  };
  
  const initialFilters = getFiltersFromUrl();
  
  // Fetch products based on current filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current filters from URL
        const filters = getFiltersFromUrl();
        
        // Default page and limit
        filters.page = filters.page || 1;
        filters.limit = filters.limit || 12;
        
        const response = await productService.getProducts(filters);
        
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Reset page when filters change
    newFilters.page = 1;
    
    // Clean up filters - remove empty values
    const cleanedFilters = {};
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedFilters[key] = value;
      }
    });
    
    // Update URL with cleaned filters
    const params = new URLSearchParams();
    
    Object.entries(cleanedFilters).forEach(([key, value]) => {
      params.set(key, value);
    });
    
    setSearchParams(params);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    // Update URL with new page
    const filters = getFiltersFromUrl();
    filters.page = newPage;
    
    // Clean up filters - remove empty values
    const cleanedFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedFilters[key] = value;
      }
    });
    
    // Update URL with cleaned filters
    const params = new URLSearchParams();
    
    Object.entries(cleanedFilters).forEach(([key, value]) => {
      params.set(key, value);
    });
    
    setSearchParams(params);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <ProductFilter 
            initialFilters={initialFilters} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        {/* Products grid */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600">
                Showing {products.length} of {pagination.count} products
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              <Pagination 
                currentPage={Number(searchParams.get('page') || 1)}
                totalPages={pagination.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList; 