import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { trackOrder } from '../../redux/slices/orderSlice';
import { FaBox, FaShippingFast, FaTruck, FaCheck, FaSpinner, FaSearch } from 'react-icons/fa';

const TrackOrder = () => {
  const { trackingNumber } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trackingInfo, loading, error } = useSelector((state) => state.order);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState(trackingNumber || '');

  useEffect(() => {
    if (trackingNumber) {
      dispatch(trackOrder(trackingNumber));
    }
  }, [dispatch, trackingNumber]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (searchTrackingNumber.trim()) {
      navigate(`/orders/track/${searchTrackingNumber.trim()}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaBox className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <FaSpinner className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <FaShippingFast className="h-6 w-6 text-indigo-500" />;
      case 'delivered':
        return <FaCheck className="h-6 w-6 text-green-500" />;
      default:
        return <FaTruck className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 border-yellow-500';
      case 'processing':
        return 'text-blue-700 border-blue-500';
      case 'shipped':
        return 'text-indigo-700 border-indigo-500';
      case 'delivered':
        return 'text-green-700 border-green-500';
      default:
        return 'text-gray-700 border-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Track Your Order</h1>

        {/* Search Form */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                id="trackingNumber"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your tracking number"
                value={searchTrackingNumber}
                onChange={(e) => setSearchTrackingNumber(e.target.value)}
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaSearch className="mr-2" /> Track
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Tracking Results */}
        {!loading && trackingInfo && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tracking #{trackingInfo.trackingNumber}
                </h2>
                <p className="mt-2 sm:mt-0 text-sm text-gray-600">
                  Expected delivery: {formatDate(trackingInfo.expectedDeliveryDate)}
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center">
                {getStatusIcon(trackingInfo.status)}
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Status: <span className="capitalize">{trackingInfo.status}</span>
                  </h3>
                  {trackingInfo.deliveredAt && (
                    <p className="text-sm text-gray-600">Delivered on {formatDate(trackingInfo.deliveredAt)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            {trackingInfo.statusHistory && trackingInfo.statusHistory.length > 0 && (
              <div className="px-6 py-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking History</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>

                  <ul className="space-y-6">
                    {trackingInfo.statusHistory.map((update, index) => (
                      <li key={index} className="relative">
                        <div className="flex items-start">
                          <div
                            className={`absolute mt-1.5 -ml-1 h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white ${getStatusColor(
                              update.status
                            )}`}
                          >
                            {getStatusIcon(update.status)}
                          </div>
                          <div className="ml-12">
                            <p className="font-medium text-gray-900 capitalize">{update.status}</p>
                            <p className="text-sm text-gray-500">{formatDate(update.updatedAt)}</p>
                            {update.note && (
                              <p className="text-sm text-gray-600 mt-1">{update.note}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Shipping Details */}
            {trackingInfo.shippingAddress && (
              <div className="px-6 py-5 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                <address className="not-italic text-sm text-gray-600">
                  <p>{trackingInfo.shippingAddress.street}</p>
                  <p>
                    {trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.state}{' '}
                    {trackingInfo.shippingAddress.zipCode}
                  </p>
                  <p>{trackingInfo.shippingAddress.country}</p>
                </address>
              </div>
            )}

            {/* Items */}
            {trackingInfo.items && trackingInfo.items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Package Contents</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {trackingInfo.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder; 