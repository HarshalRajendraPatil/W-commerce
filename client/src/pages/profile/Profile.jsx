import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import CustomerProfile from './CustomerProfile';
import VendorProfile from './VendorProfile';
import AdminProfile from './AdminProfile';
import Loader from '../../components/common/Loader';

// Keep existing vendor application functionality
import { getMyApplicationStatus, submitApplication, reset } from '../../redux/slices/vendorApplicationSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { myApplication, isLoading, isSuccess, isError, message } = useSelector((state) => state.vendorApplication);
  
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
  
  // Fetch application status for customers who might want to become vendors
  useEffect(() => {
    if (user && user.role === 'customer') {
    dispatch(getMyApplicationStatus());
    }
  }, [dispatch, user]);

  // Show error message if API request fails
  useEffect(() => {
    if (isError) {
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show appropriate profile based on user role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminProfile />;
      case 'vendor':
        return <VendorProfile />;
      default:
        return <CustomerProfile vendorApplication={myApplication} />;
    }
  }

  return <Loader />;
};

export default Profile; 