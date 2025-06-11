import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { fetchCoupons, deleteCoupon, createCoupon, updateCoupon, fetchCouponAnalytics, fetchCouponStats } from '../../redux/slices/couponSlice';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import ChartWrapper from '../../components/ChartWrapper';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, pagination, loading, error } = useSelector((state) => state.coupon);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchase: 0,
    maxDiscount: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    isActive: true,
    usageLimit: 0,
    perUserLimit: 0
  });
  
  // Load coupons on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: '-createdAt'
    };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (typeFilter) {
      params.type = typeFilter;
    }
    
    if (statusFilter) {
      params.isActive = statusFilter === 'active';
    }
    
    dispatch(fetchCoupons(params));
  }, [dispatch, currentPage, searchTerm, typeFilter, statusFilter]);
  
  // Fetch coupon analytics on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await dispatch(fetchCouponAnalytics()).unwrap();
        setAnalytics(result.data);
      } catch (error) {
        toast.error('Failed to fetch coupon analytics');
      }
    };

    fetchAnalytics();
  }, [dispatch]);
  
  // Create refs for chart data to prevent unnecessary re-renders
  const distributionChartData = useRef(null);
  const statusChartData = useRef(null);
  
  // Prepare chart data when analytics are available
  const getChartData = () => {
    if (!analytics) return null;
    
    // Only recalculate if the data has changed or hasn't been calculated yet
    if (!distributionChartData.current) {
      distributionChartData.current = {
        labels: ['Active', 'Expired', 'Percentage', 'Fixed'],
        datasets: [{
          label: 'Coupon Distribution',
          data: [
            analytics.activeCoupons,
            analytics.expiredCoupons,
            analytics.couponsByType?.percentage || 0,
            analytics.couponsByType?.fixed || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      };
    }
    
    return distributionChartData.current;
  };
  
  const getStatusChartData = () => {
    if (!analytics) return null;
    
    // Only recalculate if the data has changed or hasn't been calculated yet
    if (!statusChartData.current) {
      statusChartData.current = {
        labels: ['Active', 'Expired'],
        datasets: [{
          data: [analytics.activeCoupons, analytics.expiredCoupons],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      };
    }
    
    return statusChartData.current;
  };
  
  // Reset chart data refs when analytics change
  useEffect(() => {
    if (analytics) {
      distributionChartData.current = null;
      statusChartData.current = null;
    }
  }, [analytics]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total) {
      setCurrentPage(newPage);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Open modal for creating or editing
  const openModal = (coupon = null) => {
    if (coupon) {
      // Edit mode - populate form with coupon data
      setCurrentCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || '',
        startDate: format(new Date(coupon.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(coupon.endDate), 'yyyy-MM-dd'),
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit || 0,
        perUserLimit: coupon.perUserLimit || 0
      });
    } else {
      // Create mode - reset form
      setCurrentCoupon(null);
      setFormData({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        minPurchase: 0,
        maxDiscount: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        isActive: true,
        usageLimit: 0,
        perUserLimit: 0
      });
    }
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    if (!formData.value || Number(formData.value) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    
    if (formData.type === 'percentage' && Number(formData.value) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }
    
    // Convert string values to numbers
    const couponData = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase),
      usageLimit: Number(formData.usageLimit),
      perUserLimit: Number(formData.perUserLimit)
    };
    
    // Convert maxDiscount to number if provided
    if (formData.maxDiscount) {
      couponData.maxDiscount = Number(formData.maxDiscount);
    }
    
    try {
      if (currentCoupon) {
        // Update existing coupon
        await dispatch(updateCoupon({
          couponId: currentCoupon._id,
          couponData
        })).unwrap();
        
        toast.success(`Coupon ${couponData.code} updated successfully`);
      } else {
        // Create new coupon
        const result = await dispatch(createCoupon(couponData)).unwrap();
        
        toast.success(`Coupon ${couponData.code} created successfully`);
      }
      
      // Close modal and refresh list
      setIsModalOpen(false);
      
      // Refresh coupon list with all current filters applied
      dispatch(fetchCoupons({
        page: currentPage,
        limit: 10,
        sort: '-createdAt',
        search: searchTerm,
        type: typeFilter,
        isActive: statusFilter === 'active' ? true : (statusFilter === 'inactive' ? false : undefined)
      }));
      
      // Also refresh analytics
      dispatch(fetchCouponAnalytics());
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };
  
  // Handle coupon deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        await dispatch(deleteCoupon(id)).unwrap();
        
        // If deleting the last coupon on a page, go to previous page
        const coupon = coupons.find(c => c._id === id);
        if (coupons.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Just refresh the current page
          dispatch(fetchCoupons({
            page: currentPage,
            limit: 10,
            sort: '-createdAt',
            search: searchTerm,
            type: typeFilter,
            isActive: statusFilter === 'active' ? true : (statusFilter === 'inactive' ? false : undefined)
          }));
        }
        
        // Also refresh analytics
        dispatch(fetchCouponAnalytics());
        
        toast.success(`Coupon ${coupon?.code || ''} deleted successfully`);
      } catch (error) {
        toast.error(`Failed to delete coupon: ${error}`);
      }
    }
  };
  
  // Function to view coupon stats
  const viewCouponStats = async (couponId) => {
    try {
      const coupon = coupons.find(c => c._id === couponId);
      if (!coupon) return;

      setSelectedCoupon(coupon);
      setCouponStats(null); // Reset stats while loading
      setIsStatsModalOpen(true);
      
      const result = await dispatch(fetchCouponStats(couponId)).unwrap();
      setCouponStats(result.data);
    } catch (error) {
      toast.error('Failed to fetch coupon stats');
      setIsStatsModalOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Coupon
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coupons..."
              className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading coupons...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          {/* Coupons table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
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
                {coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-xs text-gray-500">{coupon.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.type === 'percentage' ? 
                            `${coupon.value}%` : 
                            `$${coupon.value.toFixed(2)}`
                          }
                        </div>
                        {coupon.minPurchase > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: ${coupon.minPurchase.toFixed(2)}
                          </div>
                        )}
                        {coupon.maxDiscount > 0 && coupon.type === 'percentage' && (
                          <div className="text-xs text-gray-500">
                            Max: ${coupon.maxDiscount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount || 0} used
                        </div>
                        {coupon.usageLimit > 0 && (
                          <div className="text-xs text-gray-500">
                            Limit: {coupon.usageLimit}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(coupon.startDate), 'PP')} - {format(new Date(coupon.endDate), 'PP')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(coupon.endDate) < new Date() ? 
                            'Expired' : 
                            `Expires in ${Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button 
                            onClick={() => viewCouponStats(coupon._id)}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                            title="View Coupon Statistics"
                          >
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Stats
                          </button>
                          
                          <button 
                            onClick={() => openModal(coupon)}
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                            title="Edit Coupon"
                          >
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="flex items-center text-red-600 hover:text-red-900"
                            title="Delete Coupon"
                          >
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No coupons found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md border ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="px-4 py-1 border-t border-b text-sm">
                  Page {currentPage} of {pagination.total}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.total}
                  className={`px-3 py-1 rounded-r-md border ${
                    currentPage === pagination.total 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Coupon Analytics Section */}
      {analytics && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-indigo-700">Total Coupons</h3>
                    <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900 mt-2">{analytics.totalCoupons}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-green-700">Active Coupons</h3>
                    <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-2">{analytics.activeCoupons}</p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-md border border-red-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-red-700">Expired Coupons</h3>
                    <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-2">{analytics.expiredCoupons}</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-yellow-700">Total Discount Amount</h3>
                    <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 mt-2">${analytics.totalDiscountAmount.toFixed(2)}</p>
                </div>
              </div>
              
              {analytics.mostUsedCoupons && analytics.mostUsedCoupons.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Most Used Coupons</h3>
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {analytics.mostUsedCoupons.map(coupon => (
                        <li key={coupon._id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-indigo-600">{coupon.code}</p>
                              <p className="text-sm text-gray-500">{coupon.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {coupon.usedCount || 0} uses
                              </p>
                              <p className="text-xs text-gray-500">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Coupon Distribution</h3>
                  <div className="h-64">
                    {analytics && (
                      <ChartWrapper
                        Chart={Bar}
                        type="bar"
                        data={getChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0
                              }
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Coupon Status</h3>
                  <div className="h-64 flex items-center justify-center">
                    {analytics && (
                      <ChartWrapper
                        Chart={Doughnut}
                        type="doughnut"
                        data={getStatusChartData()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Coupon Stats Modal */}
      {isStatsModalOpen && selectedCoupon && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Coupon Statistics</h2>
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-indigo-50 p-4 rounded-md mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">{selectedCoupon.code}</h3>
                  <p className="text-sm text-indigo-700">{selectedCoupon.description}</p>
                </div>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${selectedCoupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Discount</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : `$${selectedCoupon.value.toFixed(2)}`}
                  {selectedCoupon.type === 'percentage' && selectedCoupon.maxDiscount > 0 && 
                    ` (Max: $${selectedCoupon.maxDiscount.toFixed(2)})`}
                </p>
                {selectedCoupon.minPurchase > 0 && (
                  <p className="text-sm text-gray-600">
                    Min purchase: ${selectedCoupon.minPurchase.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Validity</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(selectedCoupon.startDate), 'PP')} - {format(new Date(selectedCoupon.endDate), 'PP')}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedCoupon.endDate) < new Date() 
                    ? 'Expired' 
                    : `Expires in ${Math.ceil((new Date(selectedCoupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days`}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
              
              {couponStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Usage</h4>
                      <p className="text-xl font-semibold text-gray-900">{couponStats.usageCount || 0} orders</p>
                      {selectedCoupon.usageLimit > 0 && (
                        <p className="text-sm text-gray-600">
                          {selectedCoupon.usageLimit - (couponStats.usageCount || 0)} uses remaining
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Discount Amount</h4>
                      <p className="text-xl font-semibold text-green-600">
                        ${(couponStats.totalDiscountAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {couponStats.discountPercentage 
                          ? `${couponStats.discountPercentage.toFixed(1)}% of total order value`
                          : ''}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Average Discount Per Order</h4>
                      <p className="text-xl font-semibold text-gray-900">
                        ${couponStats.averageDiscount ? couponStats.averageDiscount.toFixed(2) : '0.00'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Order Value</h4>
                      <p className="text-xl font-semibold text-gray-900">
                        ${couponStats.totalOrderValue ? couponStats.totalOrderValue.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  {couponStats.topUsers && couponStats.topUsers.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Top Users</h4>
                      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Uses
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Discount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {couponStats.topUsers.map((userStat, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{userStat.user.name}</div>
                                  <div className="text-xs text-gray-500">{userStat.user.email}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                                  {userStat.count}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                                  ${userStat.totalDiscount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {couponStats.recentOrders && couponStats.recentOrders.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Recent Orders</h4>
                      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Discount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {couponStats.recentOrders.map((order, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  #{order.orderId}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {format(new Date(order.date), 'PP')}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                                  ${order.total.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-green-600">
                                  ${order.discount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading stats...</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => openModal(selectedCoupon)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Coupon
              </button>
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for adding/editing coupons */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6">
              {currentCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. SUMMER25"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. 25% off summer sale"
                  />
                </div>
                
                {/* Discount Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Discount Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                
                {/* Discount Value */}
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                    {formData.type === 'percentage' ? 'Percentage' : 'Amount'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {formData.type === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max={formData.type === 'percentage' ? "100" : undefined}
                      step="0.01"
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                {/* Min Purchase */}
                <div>
                  <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700">
                    Minimum Purchase
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="minPurchase"
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for no minimum</p>
                </div>
                
                {/* Max Discount (for percentage type) */}
                {formData.type === 'percentage' && (
                  <div>
                    <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700">
                      Maximum Discount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="maxDiscount"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Leave empty for no maximum</p>
                  </div>
                )}
                
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                {/* Usage Limit */}
                <div>
                  <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for unlimited usage</p>
                </div>
                
                {/* Per User Limit */}
                <div>
                  <label htmlFor="perUserLimit" className="block text-sm font-medium text-gray-700">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    id="perUserLimit"
                    name="perUserLimit"
                    value={formData.perUserLimit}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for unlimited uses per user</p>
                </div>
                
                {/* Is Active */}
                <div className="col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons; 