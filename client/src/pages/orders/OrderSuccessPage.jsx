import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../../redux/slices/orderSlice';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, loading, error } = useSelector(state => state.order);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Fetch order details
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, id, isAuthenticated, navigate]);
  
  // Redirect if no order ID is provided
  useEffect(() => {
    if (!id) {
      navigate('/orders');
    }
  }, [id, navigate]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="h-12 w-12 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order details. Please try again later.</p>
          <Link
            to="/orders"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <svg className="h-14 w-14 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is now being processed.
          </p>
        </div>
        
        {currentOrder && (
          <div className="border-t border-b py-4 my-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{currentOrder._id}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">
                {new Date(currentOrder.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">
                {currentOrder.paymentMethod}
                {currentOrder.isPaid && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">
                ${currentOrder.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to={`/orders/${id}`}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            View Order Details
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 