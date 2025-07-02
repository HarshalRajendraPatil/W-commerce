import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createOrder, prepareOrder, createRazorpayOrder, processPayment } from '../../redux/slices/orderSlice';
import { clearCart } from '../../redux/slices/cartSlice';

const OrderReview = ({ checkoutData, onBack }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { preparedOrderData } = useSelector(state => state.order);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
          toast.error('Razorpay SDK failed to load. Please check your connection.');
        };
        document.body.appendChild(script);
      });
    };

    // Load Razorpay script if it's not already loaded
    if (!window.Razorpay) {
      loadRazorpayScript();
    }
    
    return () => {
      // Clean up - no need to remove the script as it should be available globally
    };
  }, []);
  
  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!window.Razorpay) {
      toast.error('Payment gateway is not available. Please refresh the page or try again later.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Calculate values
      const subtotal = cart.totalPrice;
      const taxPrice = subtotal * 0.18; // 18% tax
      const shippingPrice = 10; // Fixed shipping price
      const discountAmount = cart.discountAmount || 0;
      const totalPrice = subtotal + taxPrice - discountAmount;
      
      // 1. Prepare order data without saving to database
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          selectedVariants: item.selectedVariants || []
        })),
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        paymentMethod: 'razorpay',
        couponCode: cart.coupon?.code,
        itemsPrice: subtotal,
        taxPrice: taxPrice,
        shippingPrice: 10,
        totalPrice: totalPrice,
        discountAmount: discountAmount
      };
      
      // Prepare the order (doesn't create in database yet)
      const prepareResult = await dispatch(prepareOrder(orderData)).unwrap();
      const preparedOrderData = prepareResult.data.orderData;
      
      // 2. Create Razorpay order
      const razorpayResult = await dispatch(createRazorpayOrder(preparedOrderData)).unwrap();
      const { orderId: razorpayOrderId, amount, currency } = razorpayResult.data;
      
      // 3. Open Razorpay payment form
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'W-Commerce',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function(response) {
          // Process payment when completed
          try {
            const paymentData = {
              orderData: preparedOrderData,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            };
            
            const paymentResult = await dispatch(processPayment(paymentData)).unwrap();
            dispatch(clearCart());
            
            // Show success message
            toast.success('Payment successful! Your order has been placed.');
            
            // Immediately redirect to order success page
            navigate(`/order-success/${paymentResult.data._id}`);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: checkoutData.shippingAddress.fullName,
          email: user.email,
          contact: checkoutData.shippingAddress.phone
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled. You can try again when you\'re ready.');
            setIsProcessing(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function(response) {
        console.error("Payment failed:", response);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error.message || 'Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
      
      <div className="space-y-6">
        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{checkoutData.shippingAddress.fullName}</p>
            <p>{checkoutData.shippingAddress.street}</p>
            <p>
              {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} {checkoutData.shippingAddress.zipCode}
            </p>
            <p>{checkoutData.shippingAddress.country}</p>
            <p className="mt-1">Phone: {checkoutData.shippingAddress.phone}</p>
          </div>
        </div>
        
        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-medium mb-2">Payment Method</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-6 mr-2" />
              <span>Razorpay (Credit/Debit Card, UPI, Wallet)</span>
            </div>
          </div>
        </div>
        
        {/* Payment Security Information */}
        <div className="text-sm text-gray-500">
          <p>
            <span className="inline-block align-middle mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            Your payment information is secure. We use encrypted connections to protect your data.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handlePlaceOrder}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isProcessing ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReview; 