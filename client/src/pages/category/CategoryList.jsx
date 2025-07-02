import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../api/categoryService';
import CategoryCard from '../../components/category/CategoryCard';
import { FiGrid, FiChevronRight } from 'react-icons/fi';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get featured categories
        const featuredResponse = await categoryService.getFeaturedCategories(4);
        setFeaturedCategories(featuredResponse.data);
        
        // Get all top-level categories (level 1)
        const response = await categoryService.getCategories({ level: 1 });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h1>
            <p className="text-lg opacity-90 mb-6">
              Discover our wide range of products organized by categories to help you find exactly what you're looking for.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Browse All Products
              <FiChevronRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Categories</h2>
              <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                View All Products <FiChevronRight className="ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCategories.map((category) => (
                <div key={category._id} className="relative h-64 group overflow-hidden rounded-xl shadow-md">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <Link 
                      to={`/categories/${category._id}`}
                      className="inline-flex items-center text-white bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 px-4 py-2 rounded-lg transition-colors"
                    >
                      Explore <FiChevronRight className="ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Categories */}
        <div>
          <div className="flex items-center mb-8">
            <FiGrid className="text-indigo-600 mr-2 text-xl" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Categories</h2>
          </div>
          
          {categories.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList; 