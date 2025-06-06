import axios from './axios';

// Get all reviews (with optional product filter)
export const getReviews = async (page = 1, limit = 10, productId = null) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...(productId && { product: productId })
  }).toString();
  
  const response = await axios.get(`/reviews?${queryParams}`);
  return response.data;
};

// Get a single review by ID
export const getReviewById = async (reviewId) => {
  const response = await axios.get(`/reviews/${reviewId}`);
  return response.data;
};

// Create a new review
export const createReview = async (reviewData) => {
  // Use FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  Object.keys(reviewData).forEach(key => {
    if (key !== 'images') {
      formData.append(key, reviewData[key]);
    }
  });
  
  // Add images if present
  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await axios.post('/reviews', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  // Use FormData for file uploads
  const formData = new FormData();
  
  // Add text fields
  Object.keys(reviewData).forEach(key => {
    if (key !== 'images') {
      formData.append(key, reviewData[key]);
    }
  });
  
  // Add images if present
  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await axios.put(`/reviews/${reviewId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await axios.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Like or unlike a review
export const likeReview = async (reviewId) => {
  const response = await axios.post(`/reviews/${reviewId}/like`);
  return response.data;
};

// Admin functions
export const approveReview = async (reviewId) => {
  const response = await axios.put(`/reviews/${reviewId}/approve`);
  return response.data;
};

export const rejectReview = async (reviewId, rejectionReason) => {
  const response = await axios.put(`/reviews/${reviewId}/reject`, { rejectionReason });
  return response.data;
};

export const getProductReviewAnalytics = async (productId) => {
  const response = await axios.get(`/reviews/analytics/products/${productId}`);
  return response.data;
};

export const getReviewAnalyticsOverview = async () => {
  const response = await axios.get('/reviews/analytics/overview');
  return response.data;
}; 