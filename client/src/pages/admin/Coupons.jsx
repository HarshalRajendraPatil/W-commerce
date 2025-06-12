import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { fetchCoupons, deleteCoupon, createCoupon, updateCoupon, fetchCouponStats, fetchCouponAnalytics } from '../../redux/slices/couponSlice';
import { toast } from 'react-toastify';
import CouponStatsModal from '../../components/admin/CouponStatsModal';
import { FiTag, FiPercent, FiDollarSign, FiFilter, FiSearch, FiCalendar, FiChevronDown, FiChevronUp, FiUsers, FiClock, FiCheck } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import SkeletonLoader from '../../components/common/SkeletonLoader';



const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, pagination, loading, error, couponAnalytics } = useSelector((state) => state.coupon);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [couponStats, setCouponStats] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [minUsage, setMinUsage] = useState('');
  const [maxUsage, setMaxUsage] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  
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
  
  // Function to load coupons with all current filters
  const loadCoupons = () => {
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
    
    if (minValue) params.minValue = minValue;
    if (maxValue) params.maxValue = maxValue;
    if (minUsage) params.minUsage = minUsage;
    if (maxUsage) params.maxUsage = maxUsage;
    if (startDateFilter) params.startDate = startDateFilter;
    if (endDateFilter) params.endDate = endDateFilter;
    
          dispatch(fetchCoupons(params));
    };
  
  // Load coupons when page changes
  useEffect(() => {
    loadCoupons();
  }, [dispatch, currentPage]);
  
  // Add debounce for filters to reduce API calls
  useEffect(() => {
    if (loading) return; // Don't send requests while loading
    
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      loadCoupons();
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, statusFilter, minValue, maxValue, minUsage, maxUsage, startDateFilter, endDateFilter]);
  
  // Fetch analytics data only once when component mounts
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!couponAnalytics) {
        setAnalyticsLoading(true);
        try {
          await dispatch(fetchCouponAnalytics()).unwrap();
        } catch (error) {
          toast.error('Failed to load coupon analytics');
        } finally {
          setAnalyticsLoading(false);
        }
      }
    };
    
    fetchAnalyticsData();
  }, [dispatch, couponAnalytics]);
  
  // Memoized stats calculations to avoid recalculating on every render
  const stats = useMemo(() => {
    if (!couponAnalytics) return null;
    
    const activePercentage = couponAnalytics.totalCoupons > 0 
      ? ((couponAnalytics.activeCoupons / couponAnalytics.totalCoupons) * 100).toFixed(0)
      : 0;
      
    const expiredPercentage = couponAnalytics.totalCoupons > 0
      ? ((couponAnalytics.expiredCoupons / couponAnalytics.totalCoupons) * 100).toFixed(0)
      : 0;
      
    return {
      totalCoupons: couponAnalytics.totalCoupons || 0,
      activeCoupons: couponAnalytics.activeCoupons || 0,
      expiredCoupons: couponAnalytics.expiredCoupons || 0,
      totalDiscountAmount: couponAnalytics.totalDiscountAmount?.toFixed(2) || 0,
      mostUsedCoupons: couponAnalytics.mostUsedCoupons || [],
      activePercentage,
      expiredPercentage,
      percentageCoupons: couponAnalytics.couponsByType?.percentage || 0,
      fixedCoupons: couponAnalytics.couponsByType?.fixed || 0
    };
  }, [couponAnalytics]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // The search is handled by the debounced useEffect
    // Just prevent the form from submitting
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
        
        // No toast here as the slice already shows a toast
      } else {
        // Create new coupon
        await dispatch(createCoupon(couponData)).unwrap();
        
        // No toast here as the slice already shows a toast
      }
      
      // Close modal
      setIsModalOpen(false);
      
      // No need to refresh the list manually - the createCoupon/updateCoupon actions already update the state
      
      // Refresh analytics after a short delay to ensure server has processed the change
      setTimeout(() => {
        dispatch(fetchCouponAnalytics());
      }, 500);
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };
  
  // Handle coupon deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        const coupon = coupons.find(c => c._id === id);
        await dispatch(deleteCoupon(id)).unwrap();
        
        // If deleting the last coupon on a page, go to previous page
        if (coupons.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } 
        // No need to refresh manually - the deleteCoupon action already updates the state
        
        // Only refresh analytics if we've deleted a coupon
        const analyticsTimer = setTimeout(() => {
          dispatch(fetchCouponAnalytics());
        }, 500);
        
        toast.success(`Coupon ${coupon?.code || ''} deleted successfully`);
        
        return () => clearTimeout(analyticsTimer);
      } catch (error) {
        toast.error(`Failed to delete coupon: ${error}`);
      }
    }
  };
  
  // Function to view coupon stats
  const viewCouponStats = async (couponId) => {
    try {
      const coupon = coupons.find(c => c._id === couponId);
      if (!coupon) {
        toast.error('Coupon not found');
        return;
      }
      
      // Set coupon and open modal immediately for better UX
      setSelectedCoupon(coupon);
      setCouponStats(null); // Reset stats while loading
      setIsStatsModalOpen(true);
      
      // Fetch stats and explicitly update the local state for immediate display
      const result = await dispatch(fetchCouponStats(couponId)).unwrap();
      if (result && result.data) {
        setCouponStats(result.data);
        console.log('Coupon stats loaded:', result.data);
      } else {
        toast.warning('No stats available for this coupon');
        // Provide empty stats object to avoid null reference errors
        setCouponStats({
          usageCount: 0,
          totalDiscountAmount: 0,
          averageOrderValue: 0
        });
      }
    } catch (error) {
      console.error('Error fetching coupon stats:', error);
      toast.error('Failed to fetch coupon stats');
      setIsStatsModalOpen(false);
    }
  };
  
  // Add a reset filters function
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setMinValue('');
    setMaxValue('');
    setMinUsage('');
    setMaxUsage('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCurrentPage(1);
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
      
      {/* Enhanced Stats Cards */}
      {analyticsLoading ? (
        <SkeletonLoader.StatCard count={4} />
      ) : !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <FiTag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Coupons</h3>
                <p className="text-2xl font-bold mt-1">{pagination?.count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <FiPercent className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Filters</h3>
                <p className="text-lg font-bold mt-1">
                  {[
                    typeFilter && 'Type',
                    statusFilter && 'Status',
                    minValue && 'Min Value',
                    maxValue && 'Max Value'
                  ].filter(Boolean).join(', ') || 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <FiTag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Coupons</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalCoupons}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <FiCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Coupons</h3>
                <p className="text-2xl font-bold mt-1">{stats.activeCoupons} <span className="text-sm text-gray-500 font-normal">({stats.activePercentage}%)</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-800">
                <FiClock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Expired Coupons</h3>
                <p className="text-2xl font-bold mt-1">{stats.expiredCoupons} <span className="text-sm text-gray-500 font-normal">({stats.expiredPercentage}%)</span></p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-800">
                <FiDollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Savings</h3>
                <p className="text-2xl font-bold mt-1">${stats.totalDiscountAmount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Replace the Filters section with this enhanced version */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="w-full sm:w-1/3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or description..."
                className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </form>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              {showAdvancedFilters ? <FiChevronUp className="ml-1 h-4 w-4" /> : <FiChevronDown className="ml-1 h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Value"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Value"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Count Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Usage"
                    value={minUsage}
                    onChange={(e) => setMinUsage(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Usage"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="md:col-span-3 flex justify-end space-x-4">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                
                <button
                  onClick={() => openModal()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium shadow-sm flex items-center"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Coupon
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mt-4">
          <SkeletonLoader.TableRow columns={6} rows={5} />
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
                    Code & ID
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-100">
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
                        <div className="text-xs text-gray-500">{coupon.description.slice(0, 20)}...</div>
                        <div className="text-xs text-gray-400 mt-1">ID: {coupon._id}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => viewCouponStats(coupon._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Stats
                          </button>
                          
                          <button 
                            onClick={() => openModal(coupon)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      
      
      
      {/* Coupon Stats Modal */}
      {isStatsModalOpen && selectedCoupon && (
        <CouponStatsModal 
          coupon={selectedCoupon} 
          stats={couponStats} 
          onClose={() => setIsStatsModalOpen(false)} 
        />
      )}
      
      {/* Modal for adding/editing coupons */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-transparent backdrop-blur-sm shadow-lg">
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