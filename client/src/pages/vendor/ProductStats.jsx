import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductStats, updateProductStock, clearStockUpdateStatus } from '../../redux/slices/productStatsSlice';
import { FiArrowLeft, FiEdit, FiBarChart2, FiDollarSign, FiPackage, FiShoppingCart, FiStar } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProductStats = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    basicInfo, 
    reviewStats, 
    recentReviews, 
    orderStats, 
    monthlySales, 
    loading, 
    error,
    stockUpdateLoading,
    stockUpdateSuccess,
    stockUpdateError
  } = useSelector(state => state.productStats);
  
  const [newStockCount, setNewStockCount] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [timeRange, setTimeRange] = useState('6months'); // '1month', '3months', '6months', '1year'

  // Fetch product stats on component mount
  useEffect(() => {
    dispatch(fetchProductStats(productId));
  }, [dispatch, productId]);
  
  // Handle stock update success
  useEffect(() => {
    if (stockUpdateSuccess) {
      toast.success('Stock updated successfully');
      setShowStockModal(false);
      dispatch(clearStockUpdateStatus());
    }
    
    if (stockUpdateError) {
      toast.error(stockUpdateError);
      dispatch(clearStockUpdateStatus());
    }
  }, [stockUpdateSuccess, stockUpdateError, dispatch]);
  
  // Set initial stock count when basicInfo is loaded
  useEffect(() => {
    if (basicInfo) {
      setNewStockCount(basicInfo.stockCount.toString());
    }
  }, [basicInfo]);
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle stock update
  const handleStockUpdate = () => {
    const stockCount = parseInt(newStockCount, 10);
    
    if (isNaN(stockCount) || stockCount < 0) {
      toast.error('Please enter a valid stock count');
      return;
    }
    
    dispatch(updateProductStock({
      id: productId,
      stockCount
    }));
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!monthlySales || monthlySales.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Sales',
            data: [],
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
          },
          {
            label: 'Units Sold',
            data: [],
            borderColor: 'rgb(45, 212, 191)',
            backgroundColor: 'rgba(45, 212, 191, 0.5)',
          }
        ]
      };
    }
    
    // Filter data based on time range
    let filteredSales = [...monthlySales];
    if (timeRange === '1month') {
      filteredSales = monthlySales.slice(-1);
    } else if (timeRange === '3months') {
      filteredSales = monthlySales.slice(-3);
    } else if (timeRange === '6months') {
      filteredSales = monthlySales.slice(-6);
    } else if (timeRange === '1year') {
      filteredSales = monthlySales.slice(-12);
    }
    
    // Format month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = filteredSales.map(item => {
      const [year, month] = item.month.split('-');
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: filteredSales.map(item => item.sales),
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
        },
        {
          label: 'Units Sold',
          data: filteredSales.map(item => item.quantity),
          borderColor: 'rgb(45, 212, 191)',
          backgroundColor: 'rgba(45, 212, 191, 0.5)',
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Sales Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <p className="font-medium">Error: {error}</p>
        <button 
          onClick={() => dispatch(fetchProductStats(productId))}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (!basicInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
        <p className="font-medium">Product not found or you don't have permission to view it.</p>
        <Link to="/vendor/products" className="mt-2 text-sm text-yellow-600 hover:text-yellow-800">
          Back to products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vendor/products')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Product Statistics</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/vendor/products/edit/${productId}`}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FiEdit className="mr-2" /> Edit Product
          </Link>
        </div>
      </div>
      
      {/* Product Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
              {basicInfo.images && basicInfo.images.length > 0 ? (
                <img 
                  src={basicInfo.images[0].url} 
                  alt={basicInfo.name} 
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
            </div>
          </div>
          <div className="md:w-3/4 md:pl-6">
            <h2 className="text-xl font-semibold text-gray-900">{basicInfo.name}</h2>
            <div className="mt-2 flex items-center">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                basicInfo.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {basicInfo.published ? 'Published' : 'Draft'}
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                Category: {basicInfo.category?.name || 'Uncategorized'}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                Created: {formatDate(basicInfo.createdAt)}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <FiDollarSign className="text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(basicInfo.price)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <FiPackage className="text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Stock</p>
                    <div className="flex items-center">
                      <p className={`font-semibold ${
                        basicInfo.stockCount === 0 ? 'text-red-600' : 
                        basicInfo.stockCount < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {basicInfo.stockCount}
                      </p>
                      <button 
                        onClick={() => setShowStockModal(true)}
                        className="ml-2 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <FiStar className="text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <p className="font-semibold text-gray-900">
                        {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : 'N/A'}
                      </p>
                      {reviewStats?.totalReviews > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({reviewStats.totalReviews} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShoppingCart className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orderStats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(orderStats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiPackage className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Units Sold</p>
              <p className="text-2xl font-semibold text-gray-900">{orderStats?.totalQuantitySold || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Sales Performance</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('1month')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '1month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeRange('3months')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '3months' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeRange('6months')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '6months' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeRange('1year')}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === '1year' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              1Y
            </button>
          </div>
        </div>
        
        <div className="h-80">
          {monthlySales && monthlySales.length > 0 ? (
            <Line data={prepareChartData()} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h2>
        
        {reviewStats && reviewStats.totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="text-3xl font-bold text-gray-900 mr-2">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-5 h-5 ${star <= Math.round(reviewStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="ml-2 text-sm text-gray-500">
                  Based on {reviewStats.totalReviews} reviews
                </div>
              </div>
              
              {/* Rating breakdown */}
              <div className="space-y-2 mt-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{rating} stars</div>
                    <div className="w-full ml-2">
                      <div className="bg-gray-200 rounded-full h-2 w-full">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ 
                            width: `${reviewStats.totalReviews > 0 
                              ? (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600 text-right">
                      {reviewStats.ratingDistribution[rating] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Recent Reviews</h3>
              {recentReviews && recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={review.user?.avatar || 'https://via.placeholder.com/32'} 
                            alt={review.user?.name || 'User'} 
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{review.comment || review.text}</p>
                          
                          {review.vendorResponse && (
                            <div className="mt-2 pl-3 border-l-2 border-gray-200">
                              <p className="text-xs font-medium text-gray-700">Your Response:</p>
                              <p className="text-xs text-gray-600">{review.vendorResponse.text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Link 
                    to="/vendor/reviews" 
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View all reviews
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No reviews yet</p>
          </div>
        )}
      </div>
      
      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock</h3>
            <div className="mb-4">
              <label htmlFor="stockCount" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Count
              </label>
              <input
                type="number"
                id="stockCount"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newStockCount}
                onChange={(e) => setNewStockCount(e.target.value)}
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={stockUpdateLoading}
              >
                {stockUpdateLoading ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductStats; 