import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById, updateOrderStatus } from '../../redux/slices/orderSlice';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const OrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  
  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentOrder) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);
  
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
  
  const handleUpdateStatus = async () => {
    if (selectedStatus !== currentOrder.status) {
      try {
        await dispatch(updateOrderStatus({
          orderId: id,
          statusData: { 
            status: selectedStatus,
            note: statusNote || `Status updated to ${selectedStatus} by admin`
          }
        })).unwrap();
        
        toast.success('Order status updated successfully');
      } catch (error) {
        toast.error(error || 'Failed to update order status');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (!currentOrder) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">Order not found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Order Details</h1>
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Orders
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order #{currentOrder._id.substring(currentOrder._id.length - 6)}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Placed on {format(new Date(currentOrder.createdAt), 'PPP')}
            </p>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(currentOrder.status)}`}>
            {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
              <div className="mt-2">
                <p className="text-sm text-gray-900">{currentOrder.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-900">{currentOrder.user?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
              <div className="mt-2">
                <p className="text-sm text-gray-900">{currentOrder.shippingAddress?.street}</p>
                <p className="text-sm text-gray-900">
                  {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} {currentOrder.shippingAddress?.zipCode}
                </p>
                <p className="text-sm text-gray-900">{currentOrder.shippingAddress?.country}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment Information</h4>
              <div className="mt-2">
                <p className="text-sm text-gray-900">Method: {currentOrder.paymentMethod}</p>
                <p className="text-sm text-gray-900">Status: {currentOrder.isPaid ? 'Paid' : 'Not Paid'}</p>
                {currentOrder.isPaid && (
                  <p className="text-sm text-gray-900">
                    Paid on: {format(new Date(currentOrder.paidAt), 'PP')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 px-4 py-3 bg-gray-50">Order Items</h4>
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
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrder.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.name} />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.selectedVariants && item.selectedVariants.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Subtotal
                </th>
                <td className="px-6 py-3 text-right text-sm text-gray-900">
                  ${currentOrder.itemsPrice?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Tax
                </th>
                <td className="px-6 py-3 text-right text-sm text-gray-900">
                  ${currentOrder.taxPrice?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Shipping
                </th>
                <td className="px-6 py-3 text-right text-sm text-gray-900">
                  ${currentOrder.shippingPrice?.toFixed(2)}
                </td>
              </tr>
              {currentOrder.discountAmount > 0 && (
                <tr>
                  <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Discount
                  </th>
                  <td className="px-6 py-3 text-right text-sm text-red-600">
                    -${currentOrder.discountAmount?.toFixed(2)}
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row" colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Total
                </th>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  ${currentOrder.totalPrice?.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Update Order Status</h4>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div className="w-full md:w-2/3">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                id="note"
                name="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change"
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={selectedStatus === currentOrder.status}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                selectedStatus === currentOrder.status 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              Update Status
            </button>
          </div>
        </div>
        
        {currentOrder.statusUpdates && currentOrder.statusUpdates.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Status History</h4>
            <div className="flow-root">
              <ul className="-mb-8">
                {currentOrder.statusUpdates.map((statusUpdate, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== currentOrder.statusUpdates.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusBadgeClass(statusUpdate.status)}`}>
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Status changed to <span className="font-medium text-gray-900">{statusUpdate.status}</span>
                            </p>
                            {statusUpdate.note && (
                              <p className="mt-1 text-sm text-gray-500">{statusUpdate.note}</p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {format(new Date(statusUpdate.updatedAt), 'PPp')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderView; 