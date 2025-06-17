import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchOrders, updateOrderStatus, fetchOrderAnalytics } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import { FiPackage, FiDollarSign, FiClock, FiTruck, FiSearch, FiFilter, FiCalendar, FiChevronDown, FiChevronUp, FiCheck, FiXCircle } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const Orders = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminPagination, loading, error, orderAnalytics } = useSelector((state) => state.order);
  
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState('-createdAt');
  
  // Memoized analytics data for better performance
  const stats = useMemo(() => {
    if (!orderAnalytics) return null;
    
    return {
      totalOrders: orderAnalytics.totalOrders || 0,
      totalRevenue: orderAnalytics.totalRevenue?.toFixed(2) || 0,
      todayOrders: orderAnalytics.todayOrders || 0,
      todayRevenue: orderAnalytics.todayRevenue?.toFixed(2) || 0,
      processingOrders: orderAnalytics.ordersByStatus?.processing || 0,
      shippedOrders: orderAnalytics.ordersByStatus?.shipped || 0,
      deliveredOrders: orderAnalytics.ordersByStatus?.delivered || 0,
      cancelledOrders: orderAnalytics.ordersByStatus?.cancelled || 0
    };
  }, [orderAnalytics]);
  
  // Function to build params object for API call
  const buildOrderParams = () => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: sortOrder
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (dateFilter) {
      const today = new Date();
      const getDateRange = () => {
        switch (dateFilter) {
          case 'today':
            return { startDate: format(today, 'yyyy-MM-dd') };
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { startDate: format(yesterday, 'yyyy-MM-dd'), endDate: format(yesterday, 'yyyy-MM-dd') };
          }
          case 'last7days': {
            const last7days = new Date(today);
            last7days.setDate(last7days.getDate() - 7);
            return { startDate: format(last7days, 'yyyy-MM-dd') };
          }
          case 'last30days': {
            const last30days = new Date(today);
            last30days.setDate(last30days.getDate() - 30);
            return { startDate: format(last30days, 'yyyy-MM-dd') };
          }
          case 'thisMonth': {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: format(firstDayOfMonth, 'yyyy-MM-dd') };
          }
          default:
            return {};
        }
      };
      
      const dateRange = getDateRange();
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
    }
    
    if (minAmount) params.minAmount = minAmount;
    if (maxAmount) params.maxAmount = maxAmount;
    
    return params;
  };
  
  // Load orders on page change
  useEffect(() => {
    dispatch(fetchOrders(buildOrderParams()));
  }, [dispatch, currentPage]);
  
  // Debounce filter changes
  useEffect(() => {
    if (loading) return; // Don't send requests while loading
    
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      dispatch(fetchOrders(buildOrderParams()));
    }, 400);
    
    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm, dateFilter, startDate, endDate, minAmount, maxAmount, sortOrder]);
  
  // Fetch order analytics only once when component mounts
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!orderAnalytics) {
        setAnalyticsLoading(true);
        try {
          await dispatch(fetchOrderAnalytics()).unwrap();
        } catch (error) {
          toast.error('Failed to load order analytics');
        } finally {
          setAnalyticsLoading(false);
        }
      }
    };
    
    loadAnalytics();
  }, [dispatch, orderAnalytics]);
  
  // Add document-wide click handler to close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('[id^="dropdown-menu-"]');
      const buttons = document.querySelectorAll('[id^="dropdown-button-"]');
      
      let clickedOnButton = false;
      buttons.forEach(button => {
        if (button.contains(event.target)) {
          clickedOnButton = true;
        }
      });
      
      if (!clickedOnButton) {
        dropdowns.forEach(dropdown => {
          if (!dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
          }
        });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= adminPagination.total) {
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
    setStatusFilter('');
    setSearchTerm('');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortOrder('-createdAt');
    setCurrentPage(1);
  };
  
  // Helper function to get status badge style
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update the order status to ${newStatus}?`)) {
      try {
        await dispatch(updateOrderStatus({
          orderId,
          statusData: { 
            status: newStatus,
            note: `Status updated to ${newStatus} by admin`
          }
        })).unwrap();
        
        // Hide dropdown after update
        const dropdown = document.getElementById(`dropdown-menu-${orderId}`);
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
        
        toast.success(`Order status updated to ${newStatus}`);
        // Refresh analytics
        dispatch(fetchOrderAnalytics());
      } catch (error) {
        toast.error(error || "Failed to update status");
      }
    }
  };

  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      
      {/* Stats Cards */}
      {analyticsLoading ? (
        <SkeletonLoader.StatCard count={4} />
      ) : !stats ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <FiPackage className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <FiDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                <p className="text-2xl font-bold mt-1">${stats.totalRevenue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                <FiPackage className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Today's Orders</h3>
                <p className="text-2xl font-bold mt-1">{stats.todayOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-800">
              <FiDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
                <p className="text-2xl font-bold mt-1">{stats.todayRevenue}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID, customer..."
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
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              {showAdvancedFilters ? <FiChevronUp className="ml-1 h-4 w-4" /> : <FiChevronDown className="ml-1 h-4 w-4" />}
            </button>
            
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-totalPrice">Highest Amount</option>
              <option value="totalPrice">Lowest Amount</option>
            </select>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateFilter('');
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateFilter('');
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quick Date Filter</label>
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select period</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="thisMonth">This month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="md:col-span-3 flex justify-end">
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
      
      {loading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
          <SkeletonLoader.TableRow columns={6} rows={5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          {/* Orders table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminOrders && adminOrders.length > 0 ? (
                  adminOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{order._id.substring(order._id.length - 6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? format(new Date(order.createdAt), 'PP') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order?.totalPrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Status update dropdown */}
                        <div className="flex space-x-2">
                        <Link to={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          View
                        </Link>
                        
                        {!['delivered', 'cancelled', 'refunded'].includes(order.status) && (
                            <div className="relative inline-block text-left">
                              <div>
                                <button 
                                  type="button" 
                                  className="text-green-600 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" 
                                  id={`dropdown-button-${order._id}`}
                                  onClick={() => {
                                    // Create dynamic dropdown behavior
                                    const dropdown = document.getElementById(`dropdown-menu-${order._id}`);
                                    const allDropdowns = document.querySelectorAll('[id^="dropdown-menu-"]');
                                    
                                    // Close all other dropdowns
                                    allDropdowns.forEach(el => {
                                      if (el.id !== `dropdown-menu-${order._id}`) {
                                        el.classList.add('hidden');
                                      }
                                    });
                                    
                                    // Toggle current dropdown
                                    dropdown.classList.toggle('hidden');
                                  }}
                                >
                              Update Status
                            </button>
                              </div>
                              <div 
                                id={`dropdown-menu-${order._id}`}
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden z-10"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby={`dropdown-button-${order._id}`}
                              >
                                <div className="py-1" role="none">
                              {order.status !== 'processing' && (
                                <button
                                  onClick={() => handleStatusUpdate(order._id, 'processing')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      role="menuitem"
                                >
                                  Processing
                                </button>
                              )}
                              {order.status !== 'shipped' && (
                                <button
                                  onClick={() => handleStatusUpdate(order._id, 'shipped')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      role="menuitem"
                                >
                                  Shipped
                                </button>
                              )}
                              {order.status !== 'delivered' && (
                                <button
                                  onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      role="menuitem"
                                >
                                  Delivered
                                </button>
                              )}
                              {order.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                  className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                                      role="menuitem"
                                >
                                  Cancel
                                </button>
                              )}
                                </div>
                            </div>
                          </div>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {adminPagination && adminPagination.total > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="px-4 py-1 border-t border-b text-sm">
                  Page {currentPage} of {adminPagination.total}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === adminPagination.total}
                  className={`px-3 py-1 rounded-r-md border ${
                    currentPage === adminPagination.total 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders; 