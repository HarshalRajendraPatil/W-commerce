import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchUsers, deactivateUser, activateUser, fetchUserAnalytics } from '../../redux/slices/userSlice';
import { toast } from 'react-toastify';
import { FiUsers, FiUserCheck, FiUserX, FiShoppingBag, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiTrendingUp } from 'react-icons/fi';
import { RiAdminLine, RiUserLine, RiCustomerService2Line } from "react-icons/ri";
import { CiDeliveryTruck } from "react-icons/ci";
import Loader from '../../components/common/Loader';

const Customers = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, error, userAnalytics } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('-createdAt');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minOrders, setMinOrders] = useState('');
  const [maxOrders, setMaxOrders] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Load users and analytics on component mount
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(fetchUsers({
          page: currentPage,
          limit: 10,
          sort: sortOrder
        })),
        dispatch(fetchUserAnalytics())
      ]);
    };
    fetchData();
  }, []);

  // Load users when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: sortOrder
    };
    
    if (searchTerm) params.search = searchTerm;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.active = statusFilter === 'active';
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (minOrders) params.minOrders = minOrders;
    if (maxOrders) params.maxOrders = maxOrders;
    
    dispatch(fetchUsers(params));
  }, [dispatch, currentPage, searchTerm, roleFilter, statusFilter, sortOrder, startDate, endDate, minOrders, maxOrders]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total) {
      setCurrentPage(newPage);
    }
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setSortOrder('-createdAt');
    setStartDate('');
    setEndDate('');
    setMinOrders('');
    setMaxOrders('');
    setCurrentPage(1);
  };

  
  // Handle user deactivation
  const handleDeactivate = async (id) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      await dispatch(deactivateUser(id)).unwrap();
      // Refresh analytics without setting loading state for the whole page
      dispatch(fetchUserAnalytics());
      toast.success('User deactivated successfully');
    } catch (error) {
      toast.error(error || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle user activation
  const handleActivate = async (id) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      await dispatch(activateUser(id)).unwrap();
      // Refresh analytics without setting loading state for the whole page
      dispatch(fetchUserAnalytics());
      toast.success('User activated successfully');
    } catch (error) {
      toast.error(error || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get month name
  const getMonthName = (month) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
  };

  // Update the handleViewDetails function
  const handleViewDetails = (user) => {
    navigate(`/admin/users/${user._id}`);
  };

  if (loading && !actionLoading) {
    return <Loader />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <FiUserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.activeUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-800">
              <FiUserX className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.inactiveUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <RiAdminLine className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Admins</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.usersByRole?.[0]?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <CiDeliveryTruck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Vendors</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.usersByRole?.[1]?.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-800">
              <RiUserLine className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
              <p className="text-2xl font-bold mt-1">{userAnalytics?.usersByRole?.[2]?.count || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
            <FiTrendingUp className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-4">
            {userAnalytics?.topCustomers?.map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{customer.orderCount} orders</p>
                  <p className="text-sm text-gray-500">{formatCurrency(customer.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity & Distribution */}
        <div className="space-y-6">

          {/* User Distribution by Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              {userAnalytics?.usersByRole?.map((role) => (
                <div key={role._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      role._id === 'admin' ? 'bg-purple-100 text-purple-600' :
                      role._id === 'vendor' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {role._id === 'admin' ? <RiAdminLine className="h-5 w-5" /> :
                       role._id === 'vendor' ? <CiDeliveryTruck className="h-5 w-5" /> :
                       <RiUserLine className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{role._id}s</p>
                      <p className="text-sm text-gray-500">{role.count} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {((role.count / userAnalytics?.totalUsers) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email..."
                className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              {showAdvancedFilters ? <FiChevronUp className="ml-1 h-4 w-4" /> : <FiChevronDown className="ml-1 h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className='col-span-2'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="-name">Name (Z-A)</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-indigo-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      View Details
                    </button>
                    {user.active ? (
                      <button
                        onClick={() => handleDeactivate(user._id)}
                        disabled={actionLoading}
                        className={`text-red-600 hover:text-red-900 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading ? 'Processing...' : 'Deactivate'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user._id)}
                        disabled={actionLoading}
                        className={`text-green-600 hover:text-green-900 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {actionLoading ? 'Processing...' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.total > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, pagination.count)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.count}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(pagination.total)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers; 