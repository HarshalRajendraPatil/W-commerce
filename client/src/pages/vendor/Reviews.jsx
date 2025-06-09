import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchVendorReviews,
  respondToReview,
  setCurrentReview
} from '../../redux/slices/vendorReviewsSlice';

const VendorReviews = () => {
  const dispatch = useDispatch();
  const { 
    reviews, 
    ratingStats, 
    pagination, 
    loading, 
    error, 
    success 
  } = useSelector(state => state.vendorReviews);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [approvalFilter, setApprovalFilter] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [reviewToRespond, setReviewToRespond] = useState(null);
  const [response, setResponse] = useState('');
  
  useEffect(() => {
    loadReviews();
  }, [dispatch, currentPage, ratingFilter, approvalFilter]);
  
  useEffect(() => {
    if (success) {
      setShowResponseModal(false);
      setReviewToRespond(null);
      setResponse('');
    }
  }, [success]);
  
  const loadReviews = () => {
    const params = {
      page: currentPage,
      limit: 10
    };
    
    if (ratingFilter > 0) {
      params.rating = ratingFilter;
    }
    
    if (approvalFilter) {
      params.isApproved = approvalFilter === 'approved';
    }
    
    dispatch(fetchVendorReviews(params));
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const openResponseModal = (review) => {
    setReviewToRespond(review);
    setResponse(review.vendorResponse?.text || '');
    setShowResponseModal(true);
  };
  
  const handleResponseSubmit = () => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }
    
    dispatch(respondToReview({
      reviewId: reviewToRespond._id,
      response
    }));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const getRatingColor = (rating) => {
    switch (rating) {
      case 5:
        return 'text-green-600';
      case 4:
        return 'text-green-500';
      case 3:
        return 'text-yellow-500';
      case 2:
        return 'text-orange-500';
      case 1:
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Product Reviews</h1>
      </div>
      
      {/* Statistics */}
      <div className="bg-gray-50 p-4 mb-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Rating Statistics</h2>
            <div className="flex items-center mb-2">
              <div className="text-2xl font-bold text-indigo-600 mr-2">
                {ratingStats?.average || 0}
              </div>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-5 h-5 ${star <= Math.round(ratingStats?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500 ml-2">
                ({ratingStats?.total || 0} reviews)
              </div>
            </div>
            
            {/* Rating breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <button
                    onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                    className={`flex items-center w-16 hover:text-indigo-600 ${ratingFilter === rating ? 'text-indigo-600 font-medium' : ''}`}
                  >
                    <span>{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <div className="w-full ml-2">
                    <div className="bg-gray-200 rounded-full h-2 w-full">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${ratingStats?.[`${rating}_percent`] || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-2 w-16">
                    {ratingStats?.[rating] || 0} ({ratingStats?.[`${rating}_percent`] || 0}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">Filters</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setRatingFilter(0)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      ratingFilter === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        ratingFilter === rating ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setApprovalFilter('')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      approvalFilter === '' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setApprovalFilter('approved')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      approvalFilter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setApprovalFilter('pending')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      approvalFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : reviews?.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try changing your filters or check back later.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={review.user?.avatar || 'https://via.placeholder.com/40'} 
                        alt={review.user?.name || 'User'}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {review.product?.name || 'Product'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.text}</p>
                </div>
                
                {review.vendorResponse ? (
                  <div className="mt-4 pl-4 border-l-4 border-indigo-100">
                    <p className="text-sm font-medium text-gray-700">Your Response:</p>
                    <p className="mt-1 text-sm text-gray-600">{review.vendorResponse.text}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(review.vendorResponse.createdAt)}</p>
                    <button
                      onClick={() => openResponseModal(review)}
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit Response
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => openResponseModal(review)}
                      className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Respond to Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                    currentPage === pagination.total ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowResponseModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {reviewToRespond?.vendorResponse ? 'Edit Response' : 'Respond to Review'}
                    </h3>
                    <div className="mt-4">
                      <label htmlFor="response-text" className="block text-sm font-medium text-gray-700">
                        Your Response
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="response-text"
                          name="response"
                          rows={4}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                          placeholder="Write your response here..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleResponseSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowResponseModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorReviews; 