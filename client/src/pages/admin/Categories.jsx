import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, deleteCategory } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import CategoryForm from '../../components/admin/CategoryForm';
import CategoryStats from '../../components/admin/CategoryStats';
import Modal from '../../components/Modal';
import { Link } from 'react-router-dom';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error, success, message } = useSelector((state) => state.category);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // CRUD modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [sortOption, setSortOption] = useState('order');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Stats
  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    topLevel: 0,
    subcategories: 0,
    featured: 0,
    inactive: 0
  });

  useEffect(() => {
    loadCategories();
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, message, error]);
  
  useEffect(() => {
    // Apply filters whenever the categories or filter options change
    filterCategories();
  }, [categories, searchTerm, parentFilter, activeFilter, featuredFilter, sortOption]);

  const loadCategories = async () => {
    try {
      // Request includes product counts for each category
      await dispatch(fetchCategories({ includeStats: true })).unwrap();
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };
  
  const filterCategories = () => {
    let filtered = [...categories];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply parent filter
    if (parentFilter === 'top') {
      filtered = filtered.filter(cat => !cat.parent);
    } else if (parentFilter === 'sub') {
      filtered = filtered.filter(cat => cat.parent);
    }
    
    // Apply active filter
    if (activeFilter !== '') {
      const isActive = activeFilter === 'active';
      filtered = filtered.filter(cat => cat.isActive === isActive);
    }
    
    // Apply featured filter
    if (featuredFilter !== '') {
      const isFeatured = featuredFilter === 'featured';
      filtered = filtered.filter(cat => cat.featured === isFeatured);
    }
    
    // Apply sorting
    if (sortOption === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === '-name') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === 'order') {
      filtered.sort((a, b) => a.order - b.order);
    } else if (sortOption === '-order') {
      filtered.sort((a, b) => b.order - a.order);
    } else if (sortOption === 'products') {
      filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    }
    
    // Update the stats
    setCategoryStats({
      total: categories.length,
      topLevel: categories.filter(cat => !cat.parent).length,
      subcategories: categories.filter(cat => cat.parent).length,
      featured: categories.filter(cat => cat.featured).length,
      inactive: categories.filter(cat => !cat.isActive).length
    });
    
    setFilteredCategories(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setDeleteLoading(true);
      try {
        await dispatch(deleteCategory(id)).unwrap();
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to delete category');
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };
  
  const handleViewStats = (category) => {
    setSelectedCategory(category);
    // window.location.href = `/admin/categories/details/${category._id}`;
  };
  
  const handleFormSuccess = () => {
    // Close modals and refresh categories
    setShowAddModal(false);
    setShowEditModal(false);
    loadCategories();
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setParentFilter('');
    setActiveFilter('');
    setFeaturedFilter('');
    setSortOption('order');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
        >
          <FiPlus className="mr-2" /> Add Category
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
          <p className="text-2xl font-bold mt-2">{categoryStats.total}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Top Level</h3>
          <p className="text-2xl font-bold mt-2">{categoryStats.topLevel}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Subcategories</h3>
          <p className="text-2xl font-bold mt-2">{categoryStats.subcategories}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Featured</h3>
          <p className="text-2xl font-bold mt-2">{categoryStats.featured}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
          <p className="text-2xl font-bold mt-2">{categoryStats.inactive}</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
            </button>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="order">Order (Low to High)</option>
              <option value="-order">Order (High to Low)</option>
              <option value="name">Name (A to Z)</option>
              <option value="-name">Name (Z to A)</option>
              <option value="products">Products (Most to Least)</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={parentFilter}
                  onChange={(e) => setParentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Categories</option>
                  <option value="top">Top Level Only</option>
                  <option value="sub">Subcategories Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
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
              
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && category.image.url ? (
                          <img 
                            className="h-10 w-10 rounded-md object-cover mr-3" 
                            src={category.image.url} 
                            alt={category.name} 
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.parent ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Subcategory
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Top Level
                          </span>
                        )}
                      </div>
                      {category.parent && (
                        <div className="text-xs text-gray-500 mt-1">
                          Parent: {category.parent.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.productCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        {category.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.order}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleViewStats(category)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Stats"
                        >
                          <Link to={`/admin/categories/details/${category._id}`}>
                            <FiEye className="h-4 w-4" />
                          </Link>
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => handleDelete(category._id)}
                          disabled={deleteLoading}
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
      >
        <CategoryForm onSuccess={handleFormSuccess} />
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Category: ${selectedCategory?.name}`}
      >
        <CategoryForm 
          category={selectedCategory}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default Categories; 