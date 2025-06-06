import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../redux/slices/orderSlice';
import { FaBox, FaTruck, FaTimesCircle, FaCheck } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    dispatch(cancelOrder({ orderId: id, reason: cancelReason }));
    setShowCancelModal(false);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if order can be cancelled
  const canBeCancelled = () => {
    if (!currentOrder) return false;
    return ['pending', 'processing'].includes(currentOrder.status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">Order not found.</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{currentOrder._id.substring(currentOrder._id.length - 8)}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Placed on {formatDate(currentOrder.createdAt)}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
        <div className="mt-4">
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(currentOrder.status)}`}>
            {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
          </span>
          {currentOrder.isPaid ? (
            <span className="ml-3 px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
              Paid on {formatDate(currentOrder.paidAt)}
            </span>
          ) : (
            <span className="ml-3 px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800">
              Not Paid
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6">
          {canBeCancelled() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <FaTimesCircle className="mr-2" /> Cancel Order
            </button>
          )}
          
          {currentOrder.trackingNumber && (
            <Link
              to={`/orders/track/${currentOrder.trackingNumber}`}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaTruck className="mr-2" /> Track Package
            </Link>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {currentOrder.items.map((item, index) => (
            <li key={index} className="px-6 py-4 flex">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-center object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaBox size={24} />
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                </div>
                <div className="mt-1 flex justify-between text-sm text-gray-500">
                  <p>Qty: {item.quantity}</p>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-6 py-5 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">Subtotal:</span>
            <span className="text-gray-900">${currentOrder.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="font-medium text-gray-900">Tax:</span>
            <span className="text-gray-900">${currentOrder.taxPrice.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="font-medium text-gray-900">Shipping:</span>
            <span className="text-gray-900">${currentOrder.shippingPrice.toFixed(2)}</span>
          </div>
          {currentOrder.discountAmount > 0 && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="font-medium text-gray-900">Discount:</span>
              <span className="text-green-600">-${currentOrder.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="text-base font-bold text-gray-900">Total:</span>
            <span className="text-base font-bold text-gray-900">${currentOrder.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping and Payment Info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Shipping Address */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
          </div>
          <div className="px-6 py-5">
            <p className="font-medium text-gray-900 mb-2">Shipping Address</p>
            <address className="not-italic">
              <p>{currentOrder.shippingAddress.street}</p>
              <p>
                {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}{' '}
                {currentOrder.shippingAddress.zipCode}
              </p>
              <p>{currentOrder.shippingAddress.country}</p>
              {currentOrder.shippingAddress.phone && (
                <p className="mt-2">Phone: {currentOrder.shippingAddress.phone}</p>
              )}
            </address>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
          </div>
          <div className="px-6 py-5">
            <p className="font-medium text-gray-900 mb-2">Payment Method</p>
            <p className="capitalize">{currentOrder.paymentMethod}</p>
            {currentOrder.isPaid ? (
              <div className="mt-4">
                <div className="flex items-center text-green-600">
                  <FaCheck className="h-5 w-5 mr-1" />
                  <span className="font-medium">Paid on {formatDate(currentOrder.paidAt)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-red-600 font-medium">Not paid</div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
              <div className="text-center">
                <FaTimesCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Order</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="mb-4">
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 text-left mb-1">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    id="cancelReason"
                    rows="3"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    className="w-full p-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail; 