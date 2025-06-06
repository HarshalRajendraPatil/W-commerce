import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getReviews, likeReview, deleteReview } from '../../redux/slices/reviewSlice';
import { FaStar, FaStarHalfAlt, FaRegStar, FaThumbsUp, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import ReviewForm from './ReviewForm';

const ReviewList = ({ productId }) => {
  const dispatch = useDispatch();
  const { productReviews, loading, pagination } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Get the reviews for this product
  const reviews = productReviews[productId] || [];

  useEffect(() => {
    dispatch(getReviews({ page: currentPage, limit: 5, productId }));
  }, [dispatch, productId, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLike = (reviewId) => {
    dispatch(likeReview(reviewId));
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleDeleteReview = (reviewId) => {
    setConfirmDelete(reviewId);
  };

  const confirmDeleteReview = () => {
    dispatch(deleteReview(confirmDelete));
    setConfirmDelete(null);
  };

  const cancelDeleteReview = () => {
    setConfirmDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  // Check if user has liked a review
  const hasUserLiked = (review) => {
    return user && review.usersLiked && review.usersLiked.includes(user._id);
  };

  // Check if user is the owner of a review
  const isReviewOwner = (review) => {
    return user && review.user && review.user._id === user._id;
  };

  if (editingReview) {
    return (
      <ReviewForm
        productId={productId}
        existingReview={editingReview}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>

      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 inline-flex items-center text-xs text-green-600">
                          <FaCheckCircle className="mr-1" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h3 className="text-lg font-medium text-gray-900 mt-1">{review.title}</h3>
                    )}
                  </div>
                  {isReviewOwner(review) && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>
                    {review.user?.name || 'Anonymous'} - {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className="mt-3 text-gray-700">{review.comment}</div>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {review.images.map((image, index) => (
                        <div key={index} className="h-24 w-24 overflow-hidden rounded-md">
                          <img
                            src={image.url}
                            alt={`Review ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Like Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleLike(review._id)}
                    className={`inline-flex items-center text-sm font-medium ${
                      hasUserLiked(review) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <FaThumbsUp className="mr-1.5 h-4 w-4" />
                    <span>
                      {review.likes > 0 ? `${review.likes} ${review.likes === 1 ? 'like' : 'likes'}` : 'Like'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    pagination.current === 1 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  Previous
                </button>
                {[...Array(pagination.total)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      pagination.current === index + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.total}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    pagination.current === pagination.total ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Review</h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteReview}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 