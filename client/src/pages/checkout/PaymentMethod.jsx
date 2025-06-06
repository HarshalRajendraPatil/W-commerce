import { useState, useEffect } from 'react';

const PaymentMethod = ({ selectedMethod, onSubmit, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  
  // Always use Razorpay
  useEffect(() => {
    if (selectedMethod !== 'razorpay') {
      setPaymentMethod('razorpay');
    }
  }, [selectedMethod]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('razorpay');
  };
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      document.body.appendChild(script);
    }
    
    return () => {
      const scriptElement = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div className="relative border rounded-md px-6 py-4 flex flex-col sm:flex-row sm:items-center border-indigo-300 transition-colors">
            <div className="flex items-center h-5">
              <input
                id="razorpay"
                name="paymentMethod"
                type="radio"
                checked={true}
                className="h-4 w-4 text-indigo-600 border-gray-300"
                readOnly
              />
            </div>
            <div className="ml-3 flex flex-1 justify-between items-center">
              <label htmlFor="razorpay" className="font-medium text-gray-700">
                Razorpay
              </label>
              <div className="ml-4 flex-shrink-0">
                <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="h-6" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Secure payments powered by Razorpay. Your payment information is encrypted and securely processed.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Shipping
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Continue to Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethod; 