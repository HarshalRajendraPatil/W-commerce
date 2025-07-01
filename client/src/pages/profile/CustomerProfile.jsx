import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingBag, FiHeart, FiStar, FiCreditCard, FiCalendar, FiPackage, FiShield, FiTrash2, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getMyApplicationStatus } from '../../redux/slices/vendorApplicationSlice';
import { removeFromWishlist } from '../../redux/slices/wishlistSlice';
import ProfileHeader from '../../components/profile/ProfileHeader';
import AddressManager from '../../components/profile/AddressManager';
import StatsCard from '../../components/profile/StatsCard';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import ProductCard from '../../components/product/ProductCard';
import VendorApplicationForm from '../../components/profile/VendorApplicationForm';
import userService from '../../api/userService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { myApplication } = useSelector((state) => state.vendorApplication);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPagination, setOrderPagination] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderHistoryPage, setOrderHistoryPage] = useState(1);
  const [orderHistoryPagination, setOrderHistoryPagination] = useState(null);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Add state for wishlist and reviews pagination
  const [wishlistPage, setWishlistPage] = useState(1);
  const [wishlistPagination, setWishlistPagination] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  useEffect(() => {
    fetchProfileData();
    // Fetch vendor application status if user is logged in
    if (authUser) {
      dispatch(getMyApplicationStatus());
    }
  }, [dispatch, authUser]);
  
  // Set active tab to 'become-vendor' if the user has a pending or rejected application
  useEffect(() => {
    if (myApplication && myApplication.data) {
      const status = myApplication.data.status;
      if (status === 'pending' || status === 'rejected') {
        setActiveTab('become-vendor');
      }
    }
  }, [myApplication]);
  
  // Add effect to fetch order history when tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrderHistory(1);
    }
  }, [activeTab]);
  
  // Add effect to fetch wishlist when tab changes
  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlist(1);
    }
  }, [activeTab]);
  
  // Add effect to fetch reviews when tab changes
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews(1);
    }
  }, [activeTab]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileRes = await userService.getProfile();
      setProfile(profileRes.data);
      
      // Fetch recent orders
      const ordersRes = await userService.getMyOrders(1, 5);
      setOrders(ordersRes.data);
      setOrderPagination(ordersRes.pagination);
      
      // Fetch reviews
      const reviewsRes = await userService.getMyReviews();
      setReviews(reviewsRes.data);
      
      // Fetch wishlist
      const wishlistRes = await userService.getWishlist();
      setWishlist(wishlistRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileUpdate = (updatedUser) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...updatedUser
    }));
  };
  
  const handleAddressUpdate = (updatedUser) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      addresses: updatedUser.addresses
    }));
  };
  
  const handlePageChange = async (page) => {
    try {
      setLoading(true);
      const ordersRes = await userService.getMyOrders(page, 5);
      setOrders(ordersRes.data);
      setOrderPage(page);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch order history
  const fetchOrderHistory = async (page) => {
    setOrderHistoryLoading(true);
    try {
      const ordersRes = await userService.getMyOrders(page, 5); // More orders per page in the dedicated tab
      setOrderHistory(ordersRes.data);
      setOrderHistoryPagination(ordersRes.pagination);
      setOrderHistoryPage(page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load order history');
    } finally {
      setOrderHistoryLoading(false);
    }
  };
  
  // Add handler for order history pagination
  const handleOrderHistoryPageChange = (page) => {
    fetchOrderHistory(page);
  };
  
  // Add function to fetch wishlist with pagination
  const fetchWishlist = async (page = 1, limit = 8) => {
    setWishlistLoading(true);
    try {
      const wishlistRes = await userService.getWishlist(page, limit);
      setWishlist(wishlistRes.data);
      setWishlistPage(page);
      // If the API returns pagination info, store it
      if (wishlistRes.pagination) {
        setWishlistPagination(wishlistRes.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };
  
  // Add handler for wishlist pagination
  const handleWishlistPageChange = (page) => {
    fetchWishlist(page);
  };
  
  // Add function to fetch reviews with pagination
  const fetchReviews = async (page = 1, limit = 5) => {
    setReviewsLoading(true);
    try {
      // Update the API call to support pagination
      const reviewsRes = await userService.getMyReviews(page, limit);
      setReviews(reviewsRes.data);
      setReviewsPage(page);
      // If the API returns pagination info, store it
      if (reviewsRes.pagination) {
        setReviewsPagination(reviewsRes.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };
  
  // Add handler for reviews pagination
  const handleReviewsPageChange = (page) => {
    fetchReviews(page);
  };
  
  // Add function to handle wishlist item removal
  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      // Refresh wishlist after removal
      fetchWishlist();
      toast.success('Product removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove product from wishlist');
    }
  };
  
  if (loading || !profile) {
    return <Loader />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileHeader user={profile} onProfileUpdate={handleProfileUpdate} />
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wishlist'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wishlist
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'addresses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Addresses
            </button>
            {/* Only show the Become a Vendor tab if the user doesn't have an approved application */}
            {(!myApplication || 
              !myApplication.data || 
              (myApplication.data && myApplication.data.status !== 'approved')) && (
              <button
                onClick={() => setActiveTab('become-vendor')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'become-vendor'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Become a Vendor
                {/* Show notification badge for pending or rejected applications */}
                {myApplication && myApplication.data && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${myApplication.data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {myApplication.data.status === 'pending' ? 'Pending' : 'Update Required'}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Orders"
              value={profile.stats.orderCount}
              icon={<FiShoppingBag className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Total Spent"
              value={formatCurrency(profile.stats.totalSpent)}
              icon={<FiCreditCard className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Wishlist Items"
              value={profile.stats.wishlistCount}
              icon={<FiHeart className="h-6 w-6" />}
              color="red"
            />
            <StatsCard
              title="Reviews Written"
              value={profile.stats.reviewCount}
              icon={<FiStar className="h-6 w-6" />}
              color="yellow"
            />
          </div>
          
          {/* Vendor Application Promotional Banner */}
          {(!myApplication || 
            !myApplication.data || 
            (myApplication.data && myApplication.data.status === 'rejected')) && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md p-6 mb-8 text-white">
              <div className="md:flex items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold">Start Selling on Our Platform</h3>
                  <p className="mt-1 text-indigo-100">
                    Turn your passion into profit. Apply to become a vendor today and reach thousands of customers.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => setActiveTab('become-vendor')}
                    className="px-6 py-2 bg-white text-indigo-700 rounded-md font-medium shadow-sm hover:bg-indigo-50 focus:outline-none"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
                <div className="mt-6">
                  <a
                    href="/shop"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    Browse Products
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order._id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a
                              href={`/orders/${order._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {orderPagination && (
                  <Pagination
                    currentPage={orderPage}
                    totalPages={orderPagination.total}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
          
          {orderHistoryLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : orderHistory.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
              <div className="mt-6">
                <a
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Browse Products
                </a>
              </div>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderHistory.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/orders/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {orderHistoryPagination && (
                <Pagination
                  currentPage={orderHistoryPage}
                  totalPages={orderHistoryPagination.total}
                  onPageChange={handleOrderHistoryPageChange}
                  siblingCount={1}
                />
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'wishlist' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Wishlist</h2>
          
          {wishlistLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start adding products to your wishlist to save them for later.</p>
              <div className="mt-6">
                <a
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Browse Products
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div key={item._id} className="relative">
                  <ProductCard product={item.product} />
                  <button
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                    className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add pagination for wishlist if available */}
          {wishlistPagination && wishlistPagination.total > 1 && (
            <Pagination
              currentPage={wishlistPage}
              totalPages={wishlistPagination.total}
              onPageChange={handleWishlistPageChange}
              siblingCount={1}
            />
          )}
        </div>
      )}
      
      {activeTab === 'reviews' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Reviews</h2>
          
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md">
              <FiStar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-gray-500">Once you've purchased and reviewed products, they'll appear here.</p>
              <div className="mt-6">
                <a
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  Browse Products
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-16 h-16">
                        {review.product.images && review.product.images.length > 0 ? (
                          <img 
                            src={review.product.images[0].url} 
                            alt={review.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link to={`/products/${review.product._id}`} className="text-md font-medium text-gray-900 hover:text-indigo-600">
                          {review.product.name}
                        </Link>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/products/${review.product._id}?edit_review=${review._id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Edit review"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">{review.title}</h4>
                    <p className="mt-1 text-gray-600">{review.comment}</p>
                  </div>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((image, index) => (
                        <div key={index} className="w-16 h-16">
                          <img 
                            src={image.url} 
                            alt={`Review image ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div>
                      {review.likes && review.likes > 0 && (
                        <span className="inline-flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {review.likes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add pagination for reviews if available */}
          {reviewsPagination && reviewsPagination.total > 1 && (
            <Pagination
              currentPage={reviewsPage}
              totalPages={reviewsPagination.total}
              onPageChange={handleReviewsPageChange}
              siblingCount={1}
            />
          )}
        </div>
      )}
      
      {activeTab === 'addresses' && (
        <AddressManager 
          addresses={profile.addresses} 
          onAddressUpdate={handleAddressUpdate} 
        />
      )}
      
      {activeTab === 'become-vendor' && (
        <VendorApplicationForm />
      )}
    </div>
  );
};

export default CustomerProfile; 