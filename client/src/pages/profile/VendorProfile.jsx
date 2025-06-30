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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesData(salesPeriod);
    }
  }, [activeTab, salesPeriod]);

  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'overview') {
      fetchProducts();
    }
  }, [activeTab, productPage, searchQuery, statusFilter, sortBy]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileRes = await userService.getProfile();
      setProfile(profileRes.data);
      
      // Fetch initial sales data
      const salesRes = await userService.getVendorSales('month');
      setSalesData(salesRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: productPage,
        limit: 10,
        sort: sortBy
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'published') {
          queryParams.append('published', 'true');
        } else if (statusFilter === 'draft') {
          queryParams.append('published', 'false');
        } else if (statusFilter === 'low') {
          queryParams.append('stockStatus', 'low');
        } else if (statusFilter === 'out') {
          queryParams.append('stockStatus', 'out');
        }
      }

      const productsRes = await userService.getVendorProducts(queryParams.toString());
      setProducts(productsRes.data);
      setProductPagination(productsRes.pagination);
    } catch (error) {
      toast.error('Failed to load products');
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

  const handleToggleStatus = async (product) => {
    try {
      await userService.updateProductStatus(product._id, !product.published);
      toast.success(`Product ${product.published ? 'unpublished' : 'published'} successfully`);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await userService.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh the products list
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setProductPage(newPage);
  };
  
  if (loading || !profile) {
    return <Loader />;
  }

  console.log('products', products);
  console.log('profile', profile);
  
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
                                  src={product?.images?.[0]?.url || '/placeholder.png'}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">Slug: {product.slug || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stockCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${product.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {product.published ? 'Published' : 'Unpublished'}
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
                      onClick={() => handlePageChange(productPagination.current + 1)}
                      disabled={productPagination.current === productPagination.total}
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

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="price">Price Low-High</option>
              <option value="-price">Price High-Low</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
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
                            src={product?.images?.[0]?.url || '/placeholder.png'}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                      {product.discountPercentage > 0 && (
                        <div className="text-sm text-green-600">
                          {product.discountPercentage}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stockCount}</div>
                      {product.stockCount <= 10 && product.stockCount > 0 && (
                        <div className="text-sm text-yellow-600">Low Stock</div>
                      )}
                      {product.stockCount === 0 && (
                        <div className="text-sm text-red-600">Out of Stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {product.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.totalSales || 0} sold
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`text-${product.published ? 'yellow' : 'green'}-600 hover:text-${product.published ? 'yellow' : 'green'}-900`}
                        >
                          {product.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {productPagination && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(productPagination.current - 1)}
                  disabled={productPagination.current === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(productPagination.current + 1)}
                  disabled={productPagination.current === productPagination.total}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((productPagination.current - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(productPagination.current * 10, productPagination.count)}
                    </span>{' '}
                    of <span className="font-medium">{productPagination.count}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(productPagination.current - 1)}
                      disabled={productPagination.current === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(productPagination.total)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          productPagination.current === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(productPagination.current + 1)}
                      disabled={productPagination.current === productPagination.total}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
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