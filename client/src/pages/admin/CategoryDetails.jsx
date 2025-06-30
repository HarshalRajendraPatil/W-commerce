import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryById } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEdit2, FiPackage } from 'react-icons/fi';
import CategoryStats from '../../components/admin/CategoryStats';
import CategoryForm from '../../components/admin/CategoryForm';
import Modal from '../../components/Modal';

const CategoryDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  let { category, isLoading, error } = useSelector((state) => state.category);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'products'
  
  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id));
    }
  }, [id, dispatch]);
  
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!category && !isLoading) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-md">
        <p className="text-red-500">Category not found</p>
        <Link 
          to="/admin/categories" 
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Categories
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with actions */}
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/admin/categories" 
              className="text-gray-500 hover:text-gray-700"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">{category?.name}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {category?.parent ? `Subcategory of ${category.parent.name}` : 'Top-level category'}
          </p>
        </div>
      
      {/* Category info card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {category?.images?.url ? (
              <img 
                src={category.image.url}
                alt={category.name}
                className="h-24 w-24 object-cover rounded-md"
              />
            ) : (
              <div className="h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                <FiPackage className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1 flex space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category?.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    {category?.featured && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Display Order</p>
                  <p className="mt-1 text-base font-medium text-gray-900">{category?.order || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Slug</p>
                  <p className="mt-1 text-sm text-gray-900 truncate">{category?.slug}</p>
                </div>
              </div>
              
              {category?.description && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-1 text-sm text-gray-900">{category.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'stats' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Analytics
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'products' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="px-6 py-5">
          {activeTab === 'stats' && (
            <CategoryStats categoryId={id} />
          )}
          
          {activeTab === 'products' && (
            <div className="text-center py-8 text-gray-500">
              Products list will be displayed here (coming soon)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails; 