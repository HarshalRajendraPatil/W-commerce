import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import categoryService from '../../api/categoryService';
import productService from '../../api/productService';
import ProductCard from '../../components/product/ProductCard';
import CategoryCard from '../../components/category/CategoryCard';
import Pagination from '../../components/common/Pagination';
import { FiHome, FiChevronRight, FiGrid, FiFilter, FiShoppingBag, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const CategoryDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0
  });
  
  // Fetch category, subcategories, and products
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current page from URL
        const page = searchParams.get('page') || 1;
        const limit = searchParams.get('limit') || 12;
        const sort = searchParams.get('sort') || '-createdAt';
        
        // Fetch category
        const categoryResponse = await categoryService.getCategory(id);
        setCategory(categoryResponse.data);
        
        // Fetch subcategories
        const subcategoriesResponse = await categoryService.getCategories({ parent: categoryResponse.data._id });
        setSubcategories(subcategoriesResponse.data);
        
        // Fetch products
        const productsResponse = await productService.getProductsByCategory(id, { page, limit, sort });
        setProducts(productsResponse.data);
        setPagination(productsResponse.pagination);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError('Failed to fetch category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [id, searchParams]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.delete('page'); // Reset page when sorting changes
    setSearchParams(params);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/categories" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            Return to Categories
          </Link>
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md max-w-lg">
          <h2 className="text-xl font-bold mb-2">Category Not Found</h2>
          <p>The category you're looking for doesn't exist or has been removed.</p>
          <Link to="/categories" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }
  
  // Get current sort value
  const currentSort = searchParams.get('sort') || '-createdAt';
  
  // Sort options with icons
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First', icon: <FiArrowDown /> },
    { value: 'createdAt', label: 'Oldest First', icon: <FiArrowUp /> },
    { value: 'price', label: 'Price: Low to High', icon: <FiArrowUp /> },
    { value: '-price', label: 'Price: High to Low', icon: <FiArrowDown /> },
    { value: '-averageRating', label: 'Highest Rated', icon: <FiArrowDown /> }
  ];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Category Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-white text-opacity-90 max-w-2xl">{category.description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex py-4 text-sm">
            <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600">
              <FiHome className="mr-1" />
              <span>Home</span>
            </Link>
            <FiChevronRight className="mx-2 text-gray-400" />
            <Link to="/categories" className="text-gray-500 hover:text-indigo-600">Categories</Link>
            <FiChevronRight className="mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Subcategories (if any) */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FiGrid className="text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Subcategories</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subcategories.map((subcat) => (
                <CategoryCard key={subcat._id} category={subcat} />
              ))}
            </div>
          </div>
        )}
        
        {/* Products */}
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <FiShoppingBag className="text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <span className="ml-3 bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {pagination.count} items
              </span>
            </div>
            
            {/* Sort dropdown */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <FiFilter className="text-gray-500 ml-2" />
              <select
                id="sort"
                value={currentSort}
                onChange={handleSortChange}
                className="appearance-none bg-transparent border-none py-2 pl-2 pr-8 focus:outline-none focus:ring-0 text-gray-700 font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-4">There are no products available in this category at the moment.</p>
              <Link 
                to="/products" 
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Browse all products <FiChevronRight className="ml-1" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {pagination.total > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination 
                    currentPage={Number(searchParams.get('page') || 1)}
                    totalPages={pagination.total}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail; 