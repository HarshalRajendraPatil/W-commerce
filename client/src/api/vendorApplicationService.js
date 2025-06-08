import api from './axios';

const vendorApplicationService = {
  // Submit a vendor application
  submitApplication: async (applicationData) => {
    const response = await api.post('/vendor-applications', applicationData);
    return response.data;
  },

  // Get application status for the current user
  getMyApplicationStatus: async () => {
    const response = await api.get('/vendor-applications/me');
    return response.data;
  },

  // Admin: Get all vendor applications
  getAllApplications: async (params = {}) => {
    const response = await api.get('/vendor-applications', { params });
    console.log(response.data);
    return response.data;
  },

  // Admin: Get a specific application by ID
  getApplicationById: async (id) => {
    const response = await api.get(`/vendor-applications/${id}`);
    return response.data;
  },

  // Admin: Approve a vendor application
  approveApplication: async (id) => {
    const response = await api.put(`/vendor-applications/${id}/approve`);
    return response.data;
  },

  // Admin: Reject a vendor application
  rejectApplication: async (id, rejectionReason = '') => {
    const response = await api.put(`/vendor-applications/${id}/reject`, { rejectionReason });
    return response.data;
  }
};

export default vendorApplicationService; 