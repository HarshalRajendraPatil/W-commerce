import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllApplications, approveApplication, rejectApplication } from '../../redux/slices/vendorApplicationSlice';
import { toast } from 'react-toastify';

const VendorApplications = () => {
  const dispatch = useDispatch();
  const { applications, isLoading, isSuccess } = useSelector((state) => state.vendorApplication);
  const [rejectionModal, setRejectionModal] = useState({ open: false, id: null, reason: '' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    dispatch(getAllApplications());
  }, [dispatch]);

  // Refresh the list after successful actions
  useEffect(() => {
    if (isSuccess) {
      dispatch(getAllApplications());
    }
  }, [isSuccess, dispatch]);

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this vendor application? This will upgrade the user to vendor status.')) {
      dispatch(approveApplication(id));
    }
  };

  const openRejectionModal = (id) => {
    setRejectionModal({ open: true, id, reason: '' });
  };

  const handleRejectConfirm = () => {
    if (!rejectionModal.reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (rejectionModal.reason.length < 10) {
      toast.error('Please provide a more detailed explanation to help the applicant understand the rejection reason');
      return;
    }

    dispatch(rejectApplication({ 
      id: rejectionModal.id, 
      rejectionReason: rejectionModal.reason 
    }));
    
    setRejectionModal({ open: false, id: null, reason: '' });
  };

  const handleRejectionChange = (e) => {
    setRejectionModal({ ...rejectionModal, reason: e.target.value });
  };

  const filterApplications = () => {
    if (filter === 'all') return applications || [];
    return applications?.filter(app => app.status === filter) || [];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  // Count applications by status
  const getApplicationCounts = () => {
    if (!applications) return { all: 0, pending: 0, approved: 0, rejected: 0 };
    
    const counts = {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    
    return counts;
  };

  const counts = getApplicationCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Vendor Applications</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Applications ({counts.all})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
        </div>
      </div>

      {/* Guidance for admins */}
      {filter === 'pending' && counts.pending > 0 && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
          <h3 className="text-md font-medium text-blue-800 mb-2">Guidelines for Reviewing Applications</h3>
          <p className="text-blue-700 text-sm mb-2">
            When reviewing vendor applications, please consider the following criteria:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Legitimacy of the business (verify details if needed)</li>
            <li>Quality and suitability of products for our marketplace</li>
            <li>Completeness and professionalism of the application</li>
          </ul>
          <p className="text-blue-700 text-sm mt-2">
            For rejections, provide specific, constructive feedback that helps the applicant understand 
            what needs improvement for a successful reapplication.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading applications...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
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
                {filterApplications().length > 0 ? (
                  filterApplications().map((application) => (
                    <tr key={application._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.businessName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.user?.name}</div>
                        <div className="text-sm text-gray-500">{application.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(application.createdAt)}</div>
                        {application.status === 'pending' && (
                          <div className="text-xs text-gray-500">
                            {Math.floor((new Date() - new Date(application.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedApplication(application)} 
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(application._id)} 
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => openRejectionModal(application._id)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Application Details Modal */}
          {selectedApplication && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full mx-4">
                <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-indigo-900">
                      Application Details
                    </h3>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Business Name</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.businessName}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Business Address</p>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedApplication.businessAddress}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.phoneNumber}</p>
                  </div>
                  {selectedApplication.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Business Description</p>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedApplication.description}</p>
                    </div>
                  )}
                  {selectedApplication.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                      <p className="mt-1 text-sm text-red-600">{selectedApplication.rejectionReason}</p>
                      <p className="mt-2 text-xs text-red-500">
                        Rejected by {selectedApplication.reviewedBy?.name || 'Admin'} on {formatDate(selectedApplication.reviewedAt)}
                      </p>
                    </div>
                  )}
                  {selectedApplication.status === 'approved' && selectedApplication.reviewedBy && (
                    <div className="mb-4 p-3 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-green-700">Approval Information</p>
                      <p className="mt-1 text-xs text-green-600">
                        Approved by {selectedApplication.reviewedBy?.name || 'Admin'} on {formatDate(selectedApplication.reviewedAt)}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end mt-6">
                    {selectedApplication.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApplication(null);
                            handleApprove(selectedApplication._id);
                          }}
                          className="mr-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(null);
                            openRejectionModal(selectedApplication._id);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className={`px-4 py-2 ${selectedApplication.status === 'pending' ? 'bg-gray-200 text-gray-700' : 'bg-indigo-600 text-white'} rounded-md`}
                    >
                      {selectedApplication.status === 'pending' ? 'Cancel' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          {rejectionModal.open && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-lg w-full mx-4">
                <div className="px-6 py-4 bg-red-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-red-900">
                    Reject Application
                  </h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-4">
                      Please provide a clear, specific reason for rejection. This feedback will help the applicant 
                      understand what needs to be improved if they wish to reapply.
                    </p>
                    <div className="bg-yellow-50 p-3 rounded-md mb-4">
                      <p className="text-sm font-medium text-yellow-800">Rejection Reason Guidelines:</p>
                      <ul className="mt-1 list-disc list-inside text-xs text-yellow-700">
                        <li>Be specific about what needs improvement</li>
                        <li>Maintain a professional, constructive tone</li>
                        <li>Suggest steps the applicant can take to improve their application</li>
                        <li>Avoid vague or unhelpful feedback</li>
                      </ul>
                    </div>
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                      Reason for Rejection *
                    </label>
                    <textarea
                      id="rejectionReason"
                      name="rejectionReason"
                      value={rejectionModal.reason}
                      onChange={handleRejectionChange}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Please provide a reason for rejecting this application..."
                      required
                    />
                    <p className={`mt-1 text-xs ${
                      rejectionModal.reason.length < 10 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {rejectionModal.reason.length < 10 
                        ? 'Please provide a more detailed explanation' 
                        : 'Good explanation length'}
                    </p>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setRejectionModal({ open: false, id: null, reason: '' })}
                      className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectConfirm}
                      className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                        rejectionModal.reason.length < 10 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={rejectionModal.reason.length < 10}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorApplications; 