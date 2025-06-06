import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductReviewAnalytics } from '../../redux/slices/reviewSlice';
import { FaStar } from 'react-icons/fa';

const ReviewSummary = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviewAnalytics, loading } = useSelector((state) => state.review);
  
  useEffect(() => {
    if (productId) {
      dispatch(getProductReviewAnalytics(productId));
    }
  }, [dispatch, productId]);
  
  if (loading || !reviewAnalytics?.product) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  const { summary, distribution } = reviewAnalytics.product;
  
  // Calculate percentages for the rating bars
  const calculatePercentage = (count) => {
    if (!summary.totalReviews || summary.totalReviews === 0) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
      
      {/* Summary section */}
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="sm:w-1/3 flex flex-col items-center mb-4 sm:mb-0">
          <div className="flex items-baseline">
            <span className="text-5xl font-bold text-gray-900">{summary.averageRating}</span>
            <span className="text-lg text-gray-500 ml-1">/ 5</span>
          </div>
          <div className="flex text-yellow-400 mt-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="h-5 w-5" />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Based on {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        
        {/* Rating breakdown */}
        <div className="sm:w-2/3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center mb-2">
              <div className="w-20 text-sm text-gray-600 flex items-center">
                <span>{rating}</span>
                <FaStar className="h-3 w-3 text-yellow-400 ml-1" />
              </div>
              <div className="flex-1 h-4 bg-gray-200 rounded-full mx-2">
                <div
                  className="h-4 bg-yellow-400 rounded-full"
                  style={{ width: `${calculatePercentage(distribution[rating])}%` }}
                ></div>
              </div>
              <div className="w-12 text-sm text-gray-500 text-right">
                {distribution[rating] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Verified purchases */}
      {summary.totalReviews > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Verified Purchases</span>
            <span>{summary.verifiedPercentage}% ({summary.verifiedPurchases} of {summary.totalReviews})</span>
          </div>
        </div>
      )}
      
      {/* Recent reviews preview */}
      {reviewAnalytics.product.recentReviews && reviewAnalytics.product.recentReviews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Recent Reviews</h4>
          <div className="space-y-3">
            {reviewAnalytics.product.recentReviews.slice(0, 2).map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-3">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {review.user?.name || 'Anonymous'}
                  </span>
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-gray-900 mt-1">{review.title}</p>
                )}
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary; 