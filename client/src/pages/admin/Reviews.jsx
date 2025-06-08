import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, you would fetch data from your API
    setTimeout(() => {
      setReviews([
        { 
          _id: '1', 
          product: { _id: '101', name: 'Smartphone X' },
          user: { _id: '201', name: 'John Doe' },
          rating: 5,
          comment: 'Amazing product! Exceeded my expectations in every way.',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
        },
        { 
          _id: '2', 
          product: { _id: '102', name: 'Wireless Headphones' },
          user: { _id: '202', name: 'Jane Smith' },
          rating: 4,
          comment: 'Great sound quality, but battery life could be better.',
          status: 'approved',
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
        },
        { 
          _id: '3', 
          product: { _id: '103', name: 'Designer T-shirt' },
          user: { _id: '203', name: 'Robert Johnson' },
          rating: 2,
          comment: 'Poor fabric quality and sizing runs small.',
          status: 'pending',
          createdAt: new Date(Date.now() - 43200000), // 12 hours ago
        },
        { 
          _id: '4', 
          product: { _id: '104', name: 'Premium Watch' },
          user: { _id: '204', name: 'Emily Williams' },
          rating: 5,
          comment: 'Absolutely stunning design and perfect craftsmanship!',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        },
        { 
          _id: '5', 
          product: { _id: '105', name: 'Sports Shoes' },
          user: { _id: '205', name: 'Michael Brown' },
          rating: 1,
          comment: 'Terrible product. Fell apart after just a week of use.',
          status: 'rejected',
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.status === filter);

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-xs">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Helper function to get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        <div>
          <select 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <li key={review._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {review.user.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(review.status)}</div>
                  </div>
                  
                  <div className="mt-2">
                    <Link to={`/admin/products/${review.product._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                      {review.product.name}
                    </Link>
                    <div className="mt-1">{renderStars(review.rating)}</div>
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  </div>
                  
                  {review.status === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                      <button className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded hover:bg-green-200">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded hover:bg-red-200">
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews; 