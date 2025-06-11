import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminPagination, loading, error } = useSelector((state) => state.order);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Load orders on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: '-createdAt'
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    dispatch(fetchOrders(params));
  }, [dispatch, currentPage, statusFilter, searchTerm]);
  
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
        // No need to refresh the list, the Redux state update will handle it
      } catch (error) {
        toast.error(error || "Failed to update status");
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders..."
              className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
        </div>
        
        <div>
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
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading orders...</p>
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