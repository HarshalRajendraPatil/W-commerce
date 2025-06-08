import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, you would fetch data from your API
    setTimeout(() => {
      setCoupons([
        { 
          _id: '1', 
          code: 'SUMMER25', 
          type: 'percentage',
          value: 25,
          minPurchase: 100,
          maxDiscount: 50,
          startDate: new Date(),
          endDate: new Date(Date.now() + 2592000000), // 30 days from now
          isActive: true,
          usedCount: 45,
          usageLimit: 100
        },
        { 
          _id: '2', 
          code: 'WELCOME10', 
          type: 'percentage',
          value: 10,
          minPurchase: 0,
          maxDiscount: null,
          startDate: new Date(Date.now() - 2592000000), // 30 days ago
          endDate: new Date(Date.now() + 5184000000), // 60 days from now
          isActive: true,
          usedCount: 120,
          usageLimit: 0 // unlimited
        },
        { 
          _id: '3', 
          code: 'FLAT50', 
          type: 'fixed',
          value: 50,
          minPurchase: 200,
          maxDiscount: null,
          startDate: new Date(Date.now() - 1296000000), // 15 days ago
          endDate: new Date(Date.now() + 1296000000), // 15 days from now
          isActive: true,
          usedCount: 25,
          usageLimit: 50
        },
        { 
          _id: '4', 
          code: 'SPRING2023', 
          type: 'percentage',
          value: 15,
          minPurchase: 75,
          maxDiscount: 30,
          startDate: new Date(Date.now() - 7776000000), // 90 days ago
          endDate: new Date(Date.now() - 2592000000), // 30 days ago
          isActive: false,
          usedCount: 85,
          usageLimit: 100
        },
        { 
          _id: '5', 
          code: 'NEWYEAR', 
          type: 'percentage',
          value: 20,
          minPurchase: 50,
          maxDiscount: 40,
          startDate: new Date(Date.now() + 2592000000), // 30 days from now
          endDate: new Date(Date.now() + 7776000000), // 90 days from now
          isActive: true,
          usedCount: 0,
          usageLimit: 200
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (coupon) => {
    const now = new Date();
    
    if (!coupon.isActive) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>;
    } else if (now < new Date(coupon.startDate)) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Scheduled</span>;
    } else if (now > new Date(coupon.endDate)) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Expired</span>;
    } else if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Exhausted</span>;
    } else {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    }
  };

  const formatDiscount = (coupon) => {
    return coupon.type === 'percentage' 
      ? `${coupon.value}%${coupon.maxDiscount ? ` (Max $${coupon.maxDiscount})` : ''}` 
      : `$${coupon.value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
        <Link
          to="/admin/coupons/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Coupon
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading coupons...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                    {coupon.minPurchase > 0 && (
                      <div className="text-xs text-gray-500">Min. purchase: ${coupon.minPurchase}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDiscount(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      From: {format(new Date(coupon.startDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      To: {format(new Date(coupon.endDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.usedCount} / {coupon.usageLimit === 0 ? '∞' : coupon.usageLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/coupons/${coupon._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Coupons; 