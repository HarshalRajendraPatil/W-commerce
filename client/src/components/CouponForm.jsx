import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeCoupon } from '../redux/slices/cartSlice';

const CouponForm = () => {
  const [couponCode, setCouponCode] = useState('');
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((state) => state.cart);
  
  const hasCoupon = cart && cart.coupon;
  
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      dispatch(applyCoupon(couponCode.trim()));
    }
  };
  
  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
  };
  
  return (
    <div className="mt-4 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Have a coupon?</h3>
        {hasCoupon && (
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs text-red-600 hover:text-red-800"
            disabled={loading}
          >
            Remove
          </button>
        )}
      </div>
      
      {hasCoupon ? (
        <div className="flex items-center py-2 px-3 bg-green-50 border border-green-200 rounded-md">
          <span className="text-green-700 text-sm font-medium mr-2">
            {cart.coupon.code}
          </span>
          <span className="text-green-600 text-xs">
            {cart.discountAmount > 0 && `$${cart.discountAmount.toFixed(2)} off`}
          </span>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !couponCode.trim()}
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
};

export default CouponForm; 