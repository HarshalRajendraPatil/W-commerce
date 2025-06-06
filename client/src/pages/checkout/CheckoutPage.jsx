import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCart } from '../../redux/slices/cartSlice';
import ShippingForm from './ShippingForm';
import OrderReview from './OrderReview';
import OrderSummary from './OrderSummary';
import { toast } from 'react-toastify';

// Main steps in checkout process
const STEPS = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'review', label: 'Review & Payment' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading: cartLoading } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { loading: orderLoading } = useSelector(state => state.order);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
      phone: user?.phone || ''
    },
    saveInfo: true
  });

  // Fetch cart on page load
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    dispatch(getCart());
  }, [dispatch, isAuthenticated, navigate]);

  // Redirect to cart if empty
  useEffect(() => {
    if (!cartLoading && cart && (!cart.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  const goToNextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const handleShippingSubmit = (shippingData) => {
    setCheckoutData(prev => ({
      ...prev,
      shippingAddress: {
        ...shippingData
      },
      saveInfo: shippingData.saveInfo
    }));
    goToNextStep();
  };

  // Show loading spinner when cart is loading
  if (cartLoading || orderLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      {/* Checkout Progress Bar */}
      <div className="mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-center 
                    ${currentStep >= index 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-600'}`}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <span 
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= index ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full max-w-3xl mx-auto">
            <div 
              className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Section */}
        <div className="lg:col-span-2">
          {currentStep === 0 && (
            <ShippingForm 
              initialValues={checkoutData.shippingAddress} 
              saveInfo={checkoutData.saveInfo}
              onSubmit={handleShippingSubmit} 
            />
          )}
          
          {currentStep === 1 && (
            <OrderReview 
              checkoutData={checkoutData}
              onBack={goToPreviousStep}
            />
          )}
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary 
            cart={cart} 
            showCheckoutButton={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 