import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchVendorOrders } from '../../redux/slices/vendorOrdersSlice';
import Pagination from '../../components/common/Pagination';

const VendorOrders = () => {
  const dispatch = useDispatch();
  const { orders, statusCounts, pagination, loading, error } = useSelector(state => state.vendorOrders);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadOrders();
  }, [dispatch, currentPage, statusFilter, dateRange]);
  
  const loadOrders = () => {
    const params = {
      page: currentPage,
      limit: 10
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    if (dateRange.startDate && dateRange.endDate) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    dispatch(fetchVendorOrders(params));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    loadOrders();
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === '' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All ({statusCounts?.total || 0})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Pending ({statusCounts?.pending || 0})
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Processing ({statusCounts?.processing || 0})
            </button>
            <button
              onClick={() => setStatusFilter('shipped')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'shipped' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Shipped ({statusCounts?.shipped || 0})
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Delivered ({statusCounts?.delivered || 0})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1 text-sm rounded-full ${
                statusFilter === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Cancelled ({statusCounts?.cancelled || 0})
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center mt-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25"
              >
                Filter
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search orders by tracking #, customer name..."
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-r-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try changing your search criteria or check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.trackingNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.user ? (
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Guest</div>
                      )}
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress?.email || (order.user ? order.user.email : 'N/A')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(order.vendorSubtotal || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/vendor/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{orders.length}</span> of{' '}
                  <span className="font-medium">{pagination.count}</span> results
                </div>
              </div>
              <Pagination 
                currentPage={currentPage}
                totalPages={pagination.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorOrders; 