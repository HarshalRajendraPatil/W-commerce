import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, updateReview } from '../../redux/slices/reviewSlice';
import { FaStar, FaCamera, FaTimesCircle } from 'react-icons/fa';

const ReviewForm = ({ productId, existingReview = null, onCancel = null }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.review);
  
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 5,
    title: existingReview?.title || '',
    comment: existingReview?.comment || '',
    images: []
  });
  
  const [imagePreview, setImagePreview] = useState(
    existingReview?.images?.map(img => ({ url: img.url, file: null })) || []
  );
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create previews for the images
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    // Add files to form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };
  
  const removeImage = (index) => {
    const newPreviews = [...imagePreview];
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
    
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const reviewData = {
      product: productId,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      images: formData.images
    };
    
    if (existingReview) {
      dispatch(updateReview({ reviewId: existingReview._id, reviewData }));
    } else {
      dispatch(createReview(reviewData));
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4">
          <p>Your review has been submitted successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none mr-1"
              >
                <FaStar
                  className={`h-8 w-8 ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Summarize your experience"
            maxLength={100}
          />
        </div>
        
        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this product"
            required
            maxLength={1000}
          ></textarea>
        </div>
        
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Photos (Optional)
          </label>
          
          {/* Image previews */}
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imagePreview.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    onClick={() => removeImage(index)}
                  >
                    <FaTimesCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="images"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FaCamera className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
              </div>
              <input
                id="images"
                name="images"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : existingReview ? (
              'Update Review'
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 