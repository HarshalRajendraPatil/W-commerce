import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import categoryService from '../../api/categoryService';
import productService from '../../api/productService';
import ProductCard from '../../components/product/ProductCard';
import CategoryCard from '../../components/category/CategoryCard';
import Pagination from '../../components/common/Pagination';

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Category not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/categories" className="hover:text-indigo-600">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>
      
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>
      
      {/* Subcategories (if any) */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subcategories.map((subcat) => (
              <CategoryCard key={subcat._id} category={subcat} />
            ))}
          </div>
        </div>
      )}
      
      {/* Products */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Products</h2>
          
          {/* Sort dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={searchParams.get('sort') || '-createdAt'}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-averageRating">Highest Rated</option>
            </select>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
};

export default CategoryDetail; 