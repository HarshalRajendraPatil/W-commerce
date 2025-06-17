import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPackage, FiDollarSign, FiShoppingBag, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ProfileHeader from '../../components/profile/ProfileHeader';
import AddressManager from '../../components/profile/AddressManager';
import StatsCard from '../../components/profile/StatsCard';
import Loader from '../../components/common/Loader';
import userService from '../../api/userService';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const VendorProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData(salesPeriod);
    }
  }, [activeTab, salesPeriod]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileRes = await userService.getProfile();
      setProfile(profileRes.data);
      
      // Fetch products
      const productsRes = await userService.getVendorProducts(1, 5);
      setProducts(productsRes.data);
      setProductPagination(productsRes.pagination);
      
      // Fetch initial sales data
      const salesRes = await userService.getVendorSales('month');
      setSalesData(salesRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSalesData = async (period) => {
    try {
      const salesRes = await userService.getVendorSales(period);
      setSalesData(salesRes.data);
    } catch (error) {
      toast.error('Failed to load sales data');
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
  
  const loadMoreProducts = async () => {
    if (productPage >= productPagination.total) return;
    
    try {
      const nextPage = productPage + 1;
      const productsRes = await userService.getVendorProducts(nextPage, 5);
      setProducts([...products, ...productsRes.data]);
      setProductPage(nextPage);
    } catch (error) {
      toast.error('Failed to load more products');
    }
  };
  
  if (loading || !profile) {
    return <Loader />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileHeader user={profile} onProfileUpdate={handleProfileUpdate} />
      
      {profile.vendorInfo && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Business Name</p>
              <p className="font-medium">{profile.vendorInfo.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Business Address</p>
              <p className="font-medium">{profile.vendorInfo.businessAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Business Phone</p>
              <p className="font-medium">{profile.vendorInfo.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved Since</p>
              <p className="font-medium">{new Date(profile.vendorInfo.approvedDate).toLocaleDateString()}</p>
            </div>
          </div>
          {profile.vendorInfo.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Business Description</p>
              <p className="text-gray-700">{profile.vendorInfo.description}</p>
            </div>
          )}
        </div>
      )}
      
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
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sales Analytics
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
              title="Total Products"
              value={profile.stats.productCount}
              icon={<FiPackage className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Total Sales"
              value={formatCurrency(profile.stats.totalSales)}
              icon={<FiDollarSign className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Orders Received"
              value={profile.stats.orderCount}
              icon={<FiShoppingBag className="h-6 w-6" />}
              color="purple"
            />
            <StatsCard
              title="Avg. Order Value"
              value={formatCurrency(profile.stats.orderCount > 0 ? profile.stats.totalSales / profile.stats.orderCount : 0)}
              icon={<FiTrendingUp className="h-6 w-6" />}
              color="yellow"
            />
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Products</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                <p className="mt-1 text-sm text-gray-500">Add your first product to start selling.</p>
                <div className="mt-6">
                  <Link
                    to="/vendor/products/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    Add New Product
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.images[0] || '/placeholder.png'}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.countInStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a
                              href={`/dashboard/products/${product._id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </a>
                            <a
                              href={`/products/${product._id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {productPagination && productPage < productPagination.total && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={loadMoreProducts}
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
      
      {activeTab === 'products' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Products</h2>
            <Link
              to="/vendor/products/new"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Add New Product
            </Link>
          </div>
          
          {/* More complete product management UI */}
        </div>
      )}
      
      {activeTab === 'sales' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sales Analytics</h2>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setSalesPeriod('week')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  salesPeriod === 'week'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSalesPeriod('month')}
                className={`px-4 py-2 text-sm font-medium border-t border-b ${
                  salesPeriod === 'month'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setSalesPeriod('year')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                  salesPeriod === 'year'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          
          {salesData ? (
            <div>
              {/* Sales chart would go here */}
              <div className="h-80 bg-gray-50 rounded-md mb-6 flex items-center justify-center">
                <FiBarChart2 className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-gray-500">Sales chart visualization</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard
                  title="Period Revenue"
                  value={formatCurrency(salesData.totalRevenue)}
                  icon={<FiDollarSign className="h-6 w-6" />}
                  color="green"
                  footer={`From ${new Date(salesData.startDate).toLocaleDateString()} to ${new Date(salesData.endDate).toLocaleDateString()}`}
                />
                <StatsCard
                  title="Orders in Period"
                  value={salesData.orderCount}
                  icon={<FiShoppingBag className="h-6 w-6" />}
                  color="blue"
                  footer={salesPeriod === 'week' ? 'This week' : salesPeriod === 'month' ? 'This month' : 'This year'}
                />
                <StatsCard
                  title={salesPeriod === 'month' ? 'Monthly Growth' : salesPeriod === 'week' ? 'Weekly Growth' : 'Yearly Growth'}
                  value={`${salesData.growthRate}%`}
                  icon={<FiTrendingUp className="h-6 w-6" />}
                  color={salesData.growthRate >= 0 ? 'green' : 'red'}
                  footer={`Compared to previous ${salesPeriod}`}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Top Selling Products</h3>
                
                {salesData.topProducts && salesData.topProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Units Sold
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.topProducts.map((product) => (
                          <tr key={product._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={product.image || '/placeholder.png'}
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.unitsSold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(product.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No sales data available for this period.</p>
                )}
              </div>
            </div>
          ) : (
            <Loader />
          )}
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

export default VendorProfile; 