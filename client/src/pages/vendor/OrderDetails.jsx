import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchVendorOrderDetails, 
  updateOrderItemFulfillment,
  clearCurrentOrder,
  resetOrderState
} from '../../redux/slices/vendorOrdersSlice';

const VendorOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, detailsLoading, loading, error, success } = useSelector(state => state.vendorOrders);
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState('processing');
  const [trackingInfo, setTrackingInfo] = useState('');
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  
  useEffect(() => {
    dispatch(fetchVendorOrderDetails(id));
    
    // Clear current order when component unmounts
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id]);
  
  // Function to refresh order data
  const refreshOrderDetails = () => {
    dispatch(fetchVendorOrderDetails(id));
    toast.info('Refreshing order details...');
  };
  
  // Handle success and error states
  useEffect(() => {
    if (success) {
      toast.success('Order fulfillment status updated successfully!');
      setShowFulfillmentModal(false);
      setSelectedItems([]);
      setTrackingInfo('');
      
      // Reset success state after showing the toast
      setTimeout(() => {
        dispatch(resetOrderState());
      }, 500);
    }
    
    if (error) {
      toast.error(error || 'Failed to update fulfillment status');
      dispatch(resetOrderState());
    }
  }, [success, error, dispatch]);
  
  const handleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedItems.length === currentOrder?.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentOrder?.items.map(item => item._id) || []);
    }
  };
  
  const openFulfillmentModal = () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one item to update');
      return;
    }
    setShowFulfillmentModal(true);
  };
  
  const handleFulfillmentUpdate = () => {
    dispatch(updateOrderItemFulfillment({
      orderId: id,
      data: {
        itemIds: selectedItems,
        fulfillmentStatus,
        trackingInfo: fulfillmentStatus === 'shipped' ? trackingInfo : undefined
      }
    }));
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
  
  const handleGoBack = () => {
    navigate('/vendor/orders');
  };

  const closeModal = () => {
    setShowFulfillmentModal(false);
  };
  
  if (detailsLoading) {
    return (
        <div className="flex flex-col items-center justify-center my-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
    );
  }
  
  if (error && !currentOrder) {
    return (<>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
        <button
          onClick={handleGoBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          &larr; Back to Orders
        </button>
    </>
    );
  }



  
  if (!currentOrder) {
    return (
        <div className="text-center py-10">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
          <button
            onClick={handleGoBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            &larr; Back to Orders
          </button>
        </div>
    );
  }
  
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="text-indigo-600 hover:text-indigo-900"
              >
                &larr; Back to Orders
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">
                Order #{currentOrder.trackingNumber}
              </h1>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentOrder.status)}`}>
                {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at {new Date(currentOrder.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={openFulfillmentModal}
              disabled={selectedItems.length === 0}
              className={`inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ${
                selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Update Fulfillment
            </button>
            <button
              onClick={refreshOrderDetails}
              className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Customer Information</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Name:</span> {currentOrder.user?.name || currentOrder.shippingAddress?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Email:</span> {currentOrder.user?.email || currentOrder.shippingAddress?.email || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> {currentOrder.shippingAddress?.phone || 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Shipping Address</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.name}
              </p>
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.street}
              </p>
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.zipCode}
              </p>
              <p className="text-sm text-gray-700">
                {currentOrder.shippingAddress?.country}
              </p>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Payment Information</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Method:</span> {currentOrder.paymentMethod}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Status:</span>{' '}
                <span className={currentOrder.isPaid ? 'text-green-600' : 'text-red-600'}>
                  {currentOrder.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </p>
              {currentOrder.isPaid && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Paid on:</span> {new Date(currentOrder.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Order Items</h2>
            
            <button
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              {selectedItems.length === currentOrder?.items.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentOrder?.items.length && currentOrder?.items.length > 0}
                      onChange={handleSelectAll}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrder.items.map((item) => (
                  console.log(item),
                  <tr key={item._id}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleItemSelection(item._id)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.image || 'https://via.placeholder.com/150'}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.selectedVariants && item.selectedVariants.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {item.selectedVariants.map(variant => `${variant.name}: ${variant.value}`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.fulfillmentStatus || 'pending')}`}>
                        {(item.fulfillmentStatus || 'pending').charAt(0).toUpperCase() + (item.fulfillmentStatus || 'pending').slice(1)}
                      </span>
                      {item.fulfillmentStatus === 'shipped' && item.trackingInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tracking: {item.trackingInfo}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${currentOrder.vendorSubtotal?.toFixed(2) || 0}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      {/* Fulfillment Modal */}
      {showFulfillmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={closeModal} aria-hidden="true"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={closeModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Update Fulfillment Status
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are updating the status of {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="fulfillmentStatus" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="fulfillmentStatus"
                        name="fulfillmentStatus"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={fulfillmentStatus}
                        onChange={(e) => setFulfillmentStatus(e.target.value)}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    
                    {fulfillmentStatus === 'shipped' && (
                      <div className="mt-4">
                        <label htmlFor="trackingInfo" className="block text-sm font-medium text-gray-700">
                          Tracking Information
                        </label>
                        <input
                          type="text"
                          name="trackingInfo"
                          id="trackingInfo"
                          placeholder="Enter tracking number or URL"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={trackingInfo}
                          onChange={(e) => setTrackingInfo(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleFulfillmentUpdate}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorOrderDetails; 