import { Link } from 'react-router-dom';
import CouponForm from '../../components/CouponForm';

const OrderSummary = ({ cart, showCheckoutButton = true }) => {
  // Calculate values
  const subtotal = cart?.totalPrice || 0;
  const discount = cart?.discountAmount || 0;
  const tax = subtotal * 0.18; // 18% tax
  const shipping = 0; // Free shipping
  const total = subtotal + tax - discount;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({cart?.totalItems || 0} items)</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        {/* Coupon Form */}
        {showCheckoutButton && <CouponForm />}
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (5%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Items list (collapsed by default) */}
      {cart && cart.items && cart.items.length > 0 && (
        <div className="mt-6">
          <details>
            <summary className="font-medium text-gray-700 cursor-pointer">
              View Items ({cart.items.length})
            </summary>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-3">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center py-2 border-b border-gray-100">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 flex justify-between text-sm">
                    <div>
                      <Link 
                        to={`/products/${item.product._id}`} 
                        className="font-medium text-gray-700 hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-500 text-xs">Qty {item.quantity}</p>
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <p className="text-gray-500 text-xs">
                          {item.selectedVariants.map(v => `${v.name}: ${v.value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
      
      {/* Conditionally render checkout button */}
      {showCheckoutButton && (
        <div className="mt-6">
          <Link
            to="/checkout"
            className="block w-full py-3 px-4 text-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}
      
      {/* Edit cart link (conditionally show different message on checkout) */}
      <div className="mt-4">
        <Link
          to="/cart"
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          {showCheckoutButton ? 'View Cart Details' : 'Back to Cart'}
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary; 