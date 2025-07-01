import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getReviews, 
  approveReview, 
  rejectReview,
  getReviewAnalyticsOverview
} from '../../redux/slices/reviewSlice';
import { toast } from 'react-toastify';
import { FiFilter, FiSearch, FiCheck, FiX, FiChevronDown, FiChevronUp, FiBarChart2, FiStar } from 'react-icons/fi';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, pagination, loading, error, success, successMessage } = useSelector((state) => state.review);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // Show filters by default
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewToReject, setReviewToReject] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    overallMetrics: {
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      totalReviews: 0,
      averageRating: 0,
      totalLikes: 0
    },
    monthlyMetrics: [],
    topReviewedProducts: []
  });
  
  // Load analytics data only once on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await dispatch(getReviewAnalyticsOverview()).unwrap();
        setAnalyticsData(result.data);
      } catch (err) {
        toast.error('Failed to load review analytics');
      }
    };
    
    fetchAnalytics();
  }, [dispatch]);
  
  // Load reviews on component mount and when filter/page changes
  useEffect(() => {
    loadReviews();
  }, [dispatch, currentPage, itemsPerPage]);
  
  // Handle success and error messages
  useEffect(() => {
    if (success && successMessage) {
      toast.success(successMessage);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, successMessage, error]);
  
  // Add debounce to search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadReviews();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filter, verifiedOnly, ratingFilter]);

  // At the beginning of the component, add check for empty reviews
  const filteredReviews = reviews || [];
  
  const loadReviews = async () => {
    try {
      // Don't send a request if there's nothing to show
      if (loading) return;
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      // Add search term if present
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Only apply status filters if not 'all'
      if (filter === 'pending') {
        params.isApproved = false;
        params.isRejected = false;
      } else if (filter === 'approved') {
        params.isApproved = true;
      } else if (filter === 'rejected') {
        params.isRejected = true;
      }
      // If filter is 'all', don't add any status filters so server returns all reviews
      
      // Add verified purchase filter if selected
      if (verifiedOnly) {
        params.isVerifiedPurchase = true;
      }
      
      // Add rating filter if selected
      if (ratingFilter) {
        params.rating = ratingFilter;
      }
      
      // Dispatch the action
      await dispatch(getReviews(params)).unwrap();
    } catch (err) {
      toast.error('Failed to load reviews');
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already triggered by the useEffect that watches searchTerm
    // This just prevents the form from submitting
  };
  
  const handleApprove = async (reviewId) => {
    try {
      setActionLoading(true);
      const result = await dispatch(approveReview(reviewId)).unwrap();
      
      // Update local analyticsData without making another API call
      if (result.data && analyticsData.overallMetrics) {
        const metrics = {...analyticsData.overallMetrics};
        
        // Update the metrics based on previous status
        const review = reviews.find(r => r._id === reviewId);
        if (review) {
          if (!review.isApproved && !review.isRejected) {
            // If it was pending, decrement pending count and increment approved count
            metrics.pendingReviews = Math.max(0, metrics.pendingReviews - 1);
            metrics.approvedReviews += 1;
          } else if (review.isRejected) {
            // If it was rejected, decrement rejected count and increment approved count
            metrics.rejectedReviews = Math.max(0, metrics.rejectedReviews - 1);
            metrics.approvedReviews += 1;
          }
          
          setAnalyticsData({
            ...analyticsData,
            overallMetrics: metrics
          });
        }
        
        toast.success('Review approved successfully');
      }
    } catch (err) {
      toast.error(err || 'Failed to approve review');
    } finally {
      setActionLoading(false);
    }
  };
  
  const openRejectModal = (review) => {
    setReviewToReject(review);
    setRejectionReason('');
  };
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      setActionLoading(true);
      const result = await dispatch(rejectReview({ 
        reviewId: reviewToReject._id, 
        rejectionReason 
      })).unwrap();
      
      // Update local analyticsData without making another API call
      if (result.data && analyticsData.overallMetrics) {
        const metrics = {...analyticsData.overallMetrics};
        
        // Update the metrics based on previous status
        if (!reviewToReject.isRejected) {
          if (reviewToReject.isApproved) {
            // If it was approved, decrement approved count and increment rejected count
            metrics.approvedReviews = Math.max(0, metrics.approvedReviews - 1);
            metrics.rejectedReviews += 1;
          } else {
            // If it was pending, decrement pending count and increment rejected count
            metrics.pendingReviews = Math.max(0, metrics.pendingReviews - 1);
            metrics.rejectedReviews += 1;
          }
          
          setAnalyticsData({
            ...analyticsData,
            overallMetrics: metrics
          });
        }
        
        toast.success('Review rejected successfully');
        setReviewToReject(null);
      }
    } catch (err) {
      toast.error(err || 'Failed to reject review');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-xs">{rating ? rating.toFixed(1) : '0.0'}</span>
      </div>
    );
  };

  // Helper function to get status badge style
  const getStatusBadge = (review) => {
    if (review.isApproved) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
    } else if (review.isRejected) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
    } else {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
          <p className="text-2xl font-bold mt-2">{analyticsData?.overallMetrics?.totalReviews || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold mt-2">{analyticsData?.overallMetrics?.pendingReviews || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-bold mt-2">{analyticsData?.overallMetrics?.approvedReviews || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold mt-2">{analyticsData?.overallMetrics?.rejectedReviews || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
          <div className="flex items-center mt-2">
            <p className="text-2xl font-bold mr-2">{analyticsData?.overallMetrics?.averageRating?.toFixed(1) || 0}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(analyticsData?.overallMetrics?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Reviewed Products */}
      {analyticsData?.topReviewedProducts && analyticsData.topReviewedProducts.length > 0 && (
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
            <FiBarChart2 className="mr-2" /> Top Reviewed Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.topReviewedProducts.map((product) => (
              <div key={product._id} className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {product.productImage && product.productImage[0] && (
                    <img 
                      src={product.productImage[0].url} 
                      alt={product.productName}
                      className="h-12 w-12 object-cover rounded-md" 
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/admin/products/${product._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate block">
                    {product.productName}
                  </Link>
                  <div className="flex items-center mt-1">
                    {renderStars(product.averageRating)}
                    <span className="ml-2 text-xs text-gray-500">({product.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <form onSubmit={handleSearch} className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reviews..."
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
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Review Status
                </label>
                <select 
                  id="status-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Reviews</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            
              <div>
                <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  id="rating-filter"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <label htmlFor="verified-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Verification
                </label>
                <div className="flex items-center mt-2">
                  <input
                    id="verified-filter"
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verified-filter" className="ml-2 block text-sm text-gray-700">
                    Show verified purchases only
                  </label>
                </div>
              </div>

              <div className="flex items-end md:col-start-3">
                <button
                  onClick={() => {
                    setVerifiedOnly(false);
                    setRatingFilter('');
                    setFilter('all');
                    setSearchTerm('');
                    setCurrentPage(1);
                    loadReviews();
                  }}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading reviews...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {!filteredReviews.length ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <li key={review._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {review.user?.avatar ? (
                          <img 
                            src={review.user.avatar.url} 
                            alt={review.user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {review.user?.name ? review.user.name.charAt(0) : '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.user?.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">
                          {review.createdAt ? formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true }) : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(review)}</div>
                  </div>
                  
                  <div className="mt-2">
                    <Link 
                      to={`/admin/products/${review.product?._id || review.product}`} 
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      {review.product?.name || 'Product ID: ' + review.product}
                    </Link>
                    <div className="mt-1">
                      {review.title && (
                        <h3 className="text-sm font-medium">{review.title}</h3>
                      )}
                      {renderStars(review.rating)}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="mt-2 flex space-x-2 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image.url}
                            alt={image.caption || `Review image ${index + 1}`}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    
                    {review.isRejected && review.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <span className="font-medium">Rejection reason:</span> {review.rejectionReason}
                      </div>
                    )}
                    
                    {review.isVerifiedPurchase && (
                      <div className="mt-2">
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                          Verified Purchase
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Admin actions - always show for admins regardless of current status */}
                  <div className="mt-4 flex space-x-2">
                    {!review.isApproved && (
                      <button 
                        onClick={() => handleApprove(review._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded hover:bg-green-200"
                      >
                        <FiCheck className="mr-1" /> Approve
                      </button>
                    )}
                    
                    {!review.isRejected && (
                      <button 
                        onClick={() => openRejectModal(review)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded hover:bg-red-200"
                      >
                        <FiX className="mr-1" /> Reject
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-md">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, pagination.count)}
              </span>{' '}
              of <span className="font-medium">{pagination.count}</span> reviews
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
              disabled={currentPage === pagination.total}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === pagination.total 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {reviewToReject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Reject Review</h3>
              <button
                onClick={() => setReviewToReject(null)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this review. This will be visible to the customer.
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setReviewToReject(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {actionLoading ? 'Processing...' : 'Reject Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews; 