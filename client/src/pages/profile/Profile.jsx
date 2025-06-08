import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyApplicationStatus, submitApplication, reset } from '../../redux/slices/vendorApplicationSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  let { myApplication, isLoading, isSuccess, isError, message } = useSelector((state) => state.vendorApplication);

  myApplication = myApplication?.data;
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    phoneNumber: '',
    description: ''
  });
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Reset success state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);
  
  useEffect(() => {
    // Fetch application status when component mounts
    dispatch(getMyApplicationStatus());
  }, [dispatch]);

  // Show error message if API request fails
  useEffect(() => {
    if (isError) {
      // If the error is "No application found" for a customer, don't show as an error
      if (message !== 'No application found') {
        toast.error(message);
      }
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  // Auto-refresh status for pending applications
  useEffect(() => {
    let statusCheckInterval;
    if (myApplication?.status === 'pending') {
      // Check status every 5 minutes
      statusCheckInterval = setInterval(() => {
        dispatch(getMyApplicationStatus());
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval);
    };
  }, [dispatch, myApplication?.status]);

  // Prefill form data if reapplying
  useEffect(() => {
    if (myApplication && myApplication.status === 'rejected' && isFormVisible) {
      setFormData({
        businessName: myApplication.businessName || '',
        businessAddress: myApplication.businessAddress || '',
        phoneNumber: myApplication.phoneNumber || '',
        description: myApplication.description || ''
      });
    }
  }, [myApplication, isFormVisible]);

  // Toggle the form visibility for rejected applications
  const toggleReapplyForm = () => {
    // Clear any previous success/error states
    dispatch(reset());
    setIsFormVisible(!isFormVisible);
  };

  // Handle opening the initial application form
  const showApplicationForm = () => {
    setIsFormVisible(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.businessName || !formData.businessAddress || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Submit application
    dispatch(submitApplication(formData));
    
    // Only hide the form if the submission is not a reapplication
    if (!myApplication || myApplication.status !== 'rejected') {
      setIsFormVisible(false);
    }
    
    toast.success('Your vendor application has been submitted for review');
  };

  // Format date in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get appropriate status icon based on application status
  const getStatusIcon = (status) => {
    const icons = {
      pending: (
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      approved: (
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      rejected: (
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    };
    
    return icons[status] || icons.pending;
  };
  
  // Determine application status display
  const renderApplicationStatus = () => {
    if (!myApplication) {
      return (
        <div className="mt-4">
          <p className="mb-4 text-gray-700">
            Becoming a vendor allows you to sell your products on our marketplace and reach millions of customers. 
            Apply today to get started!
          </p>
          <button
            onClick={showApplicationForm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Apply to Become a Vendor
          </button>
        </div>
      );
    }
    
    const { status, statusInfo, createdAt, updatedAt, estimatedCompletionDate, elapsedDays, estimatedDaysRemaining } = myApplication;

    console.log(myApplication);
    
    // Return different UI based on application status
    switch (status) {
      case 'pending':
        return (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              {getStatusIcon(status)}
              <h3 className="text-lg font-medium text-yellow-700 ml-2">{statusInfo?.title || 'Application Under Review'}</h3>
            </div>
            
            <div className="mt-3">
              <p className="text-yellow-600">
                {statusInfo?.description || 'Your application is currently being reviewed by our team.'}
              </p>
              
              <div className="mt-4 bg-yellow-100 p-3 rounded-md">
                <h4 className="font-medium text-yellow-800">Application Timeline</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Submitted:</span>
                    <span className="text-yellow-800 font-medium">{formatDate(createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-700">Estimated completion:</span>
                    <span className="text-yellow-800 font-medium">{formatDate(estimatedCompletionDate)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-100/50 p-3 rounded-md">
                <p className="text-yellow-700 text-sm">
                  <span className="font-medium">Note:</span> {statusInfo?.nextSteps || 'We typically review applications within 2-3 business days.'}
                </p>
                {estimatedDaysRemaining > 0 && (
                  <p className="text-yellow-700 text-sm mt-1">
                    Estimated wait time remaining: <span className="font-medium">{estimatedDaysRemaining} day{estimatedDaysRemaining !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-yellow-700 text-sm">
                  <span className="font-medium">Application ID:</span> {myApplication._id.substring(0, 8)}...
                </div>
                <button 
                  onClick={() => dispatch(getMyApplicationStatus())} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'approved':
        return (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              {getStatusIcon(status)}
              <h3 className="text-lg font-medium text-green-700 ml-2">{statusInfo?.title || 'Application Approved'}</h3>
            </div>
            
            <div className="mt-3">
              <p className="text-green-600">
                {statusInfo?.description || 'Congratulations! Your vendor application has been approved.'}
              </p>
              
              <div className="mt-4 bg-green-100 p-3 rounded-md">
                <h4 className="font-medium text-green-800">Application Details</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Business Name:</span>
                    <span className="text-green-800 font-medium">{myApplication.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Submitted on:</span>
                    <span className="text-green-800 font-medium">{formatDate(createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Approved on:</span>
                    <span className="text-green-800 font-medium">{formatDate(updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-green-100/50 p-3 rounded-md">
                <p className="text-green-700 text-sm">
                  <span className="font-medium">Next Steps:</span> {statusInfo?.nextSteps || 'Logout and login again to access your vendor dashboard.'}
                </p>
              </div>
              
              <div className="mt-4 flex justify-center">
                <a 
                  href="/vendor/dashboard" 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none inline-flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Go to Vendor Dashboard
                </a>
              </div>
            </div>
          </div>
        );
        
      case 'rejected':
        return (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              {getStatusIcon(status)}
              <h3 className="text-lg font-medium text-red-700 ml-2">{statusInfo?.title || 'Application Not Approved'}</h3>
            </div>
            
            <div className="mt-3">
              <p className="text-red-600">
                {statusInfo?.description || 'Unfortunately, your vendor application was not approved at this time.'}
              </p>
              
              {myApplication.rejectionReason && (
                <div className="mt-4 bg-red-100 p-3 rounded-md">
                  <h4 className="font-medium text-red-800">Feedback from our team</h4>
                  <p className="mt-2 text-red-700">{myApplication.rejectionReason}</p>
                </div>
              )}
              
              <div className="mt-4 bg-red-100/50 p-3 rounded-md">
                <h4 className="font-medium text-red-800">Application Details</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-700">Submitted on:</span>
                    <span className="text-red-800 font-medium">{formatDate(createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Reviewed on:</span>
                    <span className="text-red-800 font-medium">{formatDate(updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <span className="font-medium">Next Steps:</span> {statusInfo?.nextSteps || 'Please review the feedback provided and consider addressing the concerns before reapplying.'}
                </p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={toggleReapplyForm}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                  {isFormVisible ? 'Cancel Reapplication' : 'Apply Again'}
                </button>
                <a 
                  href="/contact?subject=Vendor Application"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Contact Support
                </a>
              </div>
            </div>
            
            {/* Reapplication Form */}
            {isFormVisible && (
              <div className="mt-6 border-t border-red-200 pt-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Reapply as a Vendor</h4>
                <div className="bg-yellow-50 p-3 rounded-md mb-4 border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Tip:</strong> Please review the rejection reason above and make appropriate changes to your application.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                      Business Address *
                    </label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Business Phone *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Tell us about your business
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                      Describe your products, experience, and why you want to become a vendor
                    </p>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={toggleReapplyForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Resubmit Application'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-gray-900">{user?.name || 'Not available'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-gray-900">{user?.email || 'Not available'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account role</dt>
              <dd className="mt-1 text-gray-900 capitalize">{user?.role || 'customer'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="mt-1 text-gray-900">{user?.createdAt ? formatDate(user.createdAt) : 'Not available'}</dd>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vendor Application Section */}
      {user?.role === 'customer' && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Vendor Program</h2>
              <p className="mt-1 text-sm text-gray-500">Apply to sell your products on our marketplace</p>
            </div>
            {myApplication && (
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  myApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  myApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {myApplication?.status?.charAt(0).toUpperCase() + myApplication?.status?.slice(1)}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {myApplication?.status === 'pending' ? 'Under Review' :
                   myApplication.status === 'approved' ? 'Ready to Sell' :
                   'Not Approved'}
                </span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Loading application status...</p>
              </div>
            ) : (
              <>
                {/* Application Status */}
                {renderApplicationStatus()}
                
                {/* Application Form - Only show for new applications */}
                {isFormVisible && !myApplication && (
                  <div className="mt-6">
                    <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
                      <div className="flex">
                        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="text-md font-medium text-blue-700">Application Guidelines</h3>
                          <p className="text-blue-600 text-sm mt-1">
                            Please provide accurate business information. Our team will review your application 
                            within 2-3 business days. If approved, you'll be able to start selling on our platform.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                          Business Address *
                        </label>
                        <textarea
                          id="businessAddress"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleChange}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                          Business Phone *
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Tell us about your business
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                          Describe your products, experience, and why you want to become a vendor
                        </p>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsFormVisible(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 