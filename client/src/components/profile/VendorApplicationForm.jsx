import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { submitApplication, getMyApplicationStatus, reset, resetApplicationData } from '../../redux/slices/vendorApplicationSlice';
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

const VendorApplicationForm = () => {
  const dispatch = useDispatch();
  const { myApplication, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.vendorApplication
  );

  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    phoneNumber: '',
    description: ''
  });

  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  useEffect(() => {
    dispatch(getMyApplicationStatus());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess) {
      toast.success('Your vendor application has been submitted successfully!');
    }
  }, [isError, isSuccess, message]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.businessName || !formData.businessAddress || !formData.phoneNumber) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Show confirmation dialog
    if (window.confirm(
      'Are you sure you want to submit your vendor application? ' +
      'Please ensure all information is accurate as this will be reviewed by our team.'
    )) {
      dispatch(submitApplication(formData));
      setHasCheckedStatus(true);
    }
  };

  // Render different UI based on application status
  if (myApplication && myApplication.data) {
    const application = myApplication.data;
    
    if (application.status === 'approved') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-green-800">Your application has been approved!</h3>
          <p className="mt-2 text-sm text-green-600">
            Congratulations! You now have vendor privileges. You can access your vendor dashboard to start selling products.
          </p>
          <div className="mt-6">
            <a
              href="/vendor/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              Go to Vendor Dashboard
            </a>
          </div>
        </div>
      );
    }
    
    if (application.status === 'pending') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FiClock className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-4 text-lg font-medium text-yellow-800">Your application is under review</h3>
          <p className="mt-2 text-sm text-yellow-600">
            We've received your application to become a vendor. Our team is currently reviewing it.
            You'll be notified once a decision has been made.
          </p>
          <div className="mt-4 bg-white rounded-md p-4 text-left">
            <h4 className="text-sm font-medium text-gray-900">Application Details</h4>
            <dl className="mt-2 text-sm">
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <dt className="text-gray-500">Business Name</dt>
                <dd className="text-gray-900">{application.businessName}</dd>
                <dt className="text-gray-500">Business Address</dt>
                <dd className="text-gray-900">{application.businessAddress}</dd>
                <dt className="text-gray-500">Phone Number</dt>
                <dd className="text-gray-900">{application.phoneNumber}</dd>
                <dt className="text-gray-500">Submitted On</dt>
                <dd className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      );
    }
    
    if (application.status === 'rejected') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-medium text-red-800">Your application was not approved</h3>
            <p className="mt-2 text-sm text-red-600">
              Unfortunately, your vendor application was not approved at this time.
            </p>
          </div>
          
          <div className="mt-4 bg-white rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900">Reason for Rejection</h4>
            <p className="mt-1 text-sm text-gray-700">{application.rejectionReason || 'No specific reason provided.'}</p>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setHasCheckedStatus(false);
                dispatch(resetApplicationData());
                // Initialize form with previous business name to make reapplication easier
                setFormData({
                  ...formData,
                  businessName: application.businessName || '',
                  businessAddress: application.businessAddress || '',
                  phoneNumber: application.phoneNumber || '',
                  // Let them update the description
                  description: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Apply Again
            </button>
          </div>
        </div>
      );
    }
  }

  // No application found or user wants to apply (again)
  if (!myApplication || !myApplication.data || !hasCheckedStatus) {
    // Check if we're reapplying after rejection (formData has been pre-filled)
    const isReapplying = formData.businessName !== '' && !myApplication;
    
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {isReapplying ? 'Reapply to Become a Vendor' : 'Apply to Become a Vendor'}
        </h2>
        
        {isReapplying && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="text-md font-medium text-yellow-800 mb-2">You're submitting a new application</h3>
            <p className="text-sm text-yellow-700">
              Your previous application was not approved. Please review the feedback provided and make necessary 
              changes to increase your chances of approval. We've pre-filled some of your information to make 
              the process easier.
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          Complete the form below to apply for a vendor account. This will allow you to sell products on our platform.
          Our team will review your application and get back to you shortly.
        </p>
        
        {/* Application process documentation */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-md font-medium text-blue-800 mb-2">Vendor Application Process</h3>
          <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
            <li>Fill out and submit the application form below</li>
            <li>Our team will review your application (typically within 1-3 business days)</li>
            <li>If approved, you'll gain access to the vendor dashboard</li>
            <li>You can then start adding products and managing your store</li>
          </ol>
          <div className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> Please ensure all information provided is accurate and up-to-date. This helps us process your application faster.
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                Business Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Tell us about your business, what products you plan to sell, and your experience..."
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  return <div className="text-center py-4">Loading application status...</div>;
};

export default VendorApplicationForm; 