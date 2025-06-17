import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingBag, FiHeart, FiStar, FiCreditCard, FiCalendar, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ProfileHeader from '../../components/profile/ProfileHeader';
import AddressManager from '../../components/profile/AddressManager';
import StatsCard from '../../components/profile/StatsCard';
import Loader from '../../components/common/Loader';
import userService from '../../api/userService';
import { formatCurrency } from '../../utils/formatters';

const CustomerProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPagination, setOrderPagination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
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
  
  const loadMoreOrders = async () => {
    if (orderPage >= orderPagination.total) return;
    
    try {
      const nextPage = orderPage + 1;
      const ordersRes = await userService.getMyOrders(nextPage, 5);
      setOrders([...orders, ...ordersRes.data]);
      setOrderPage(nextPage);
    } catch (error) {
      toast.error('Failed to load more orders');
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
                
                {orderPagination && orderPage < orderPagination.total && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={loadMoreOrders}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
          
          {/* Order history content (similar to recent orders but with more details) */}
          {/* This would be a more detailed version of the orders section in the overview tab */}
        </div>
      )}
      
      {activeTab === 'wishlist' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Wishlist</h2>
          
          {/* Wishlist content - grid of product cards */}
        </div>
      )}
      
      {activeTab === 'reviews' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Reviews</h2>
          
          {/* Reviews content - list of reviews with product info */}
        </div>
      )}
      
      {activeTab === 'addresses' && (
        <AddressManager 
          addresses={profile.addresses} 
          onAddressUpdate={handleAddressUpdate} 
        />
      )}
    </div>
  );
};

export default CustomerProfile; 