import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchVendorAnalytics, 
  setTimeFrame,
  setProductsPage,
  setCategoriesPage
} from '../../redux/slices/vendorAnalyticsSlice';
import Pagination from '../../components/common/Pagination';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const VendorAnalytics = () => {
  const dispatch = useDispatch();
  const { 
    data, 
    loading, 
    error, 
    timeFrame,
    pagination 
  } = useSelector(state => state.vendorAnalytics);
  
  useEffect(() => {
    loadAnalytics();
  }, [dispatch, timeFrame, pagination.products.current, pagination.categories.current]);
  
  const loadAnalytics = () => {
    dispatch(fetchVendorAnalytics({
      timeFrame,
      page: pagination.products.current,
      limit: 5
    }));
  };
  
  const handleTimeFrameChange = (newTimeFrame) => {
    dispatch(setTimeFrame(newTimeFrame));
  };
  
  const handleProductsPageChange = (page) => {
    dispatch(setProductsPage(page));
  };
  
  const handleCategoriesPageChange = (page) => {
    dispatch(setCategoriesPage(page));
  };
  
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format data for charts
  const salesChartData = Array.isArray(data?.sales?.data) ? data.sales.data : [];
  
  // Format data for category chart
  const categoryChartData = Array.isArray(data?.revenueByCategory) ? data.revenueByCategory : [];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
        
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handleTimeFrameChange('7days')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                timeFrame === '7days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleTimeFrameChange('30days')}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === '30days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              30 Days
            </button>
            <button
              onClick={() => handleTimeFrameChange('90days')}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === '90days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              90 Days
            </button>
            <button
              onClick={() => handleTimeFrameChange('1year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                timeFrame === '1year'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">Total Revenue</h2>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  (data?.sales?.growth || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(data?.sales?.growth || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.sales?.growth || 0).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(data?.sales?.total || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {timeFrame === '7days' ? 'Past 7 days' :
                   timeFrame === '30days' ? 'Past 30 days' :
                   timeFrame === '90days' ? 'Past 90 days' : 'Past year'}
                </p>
              </div>
            </div>
            
            {/* Orders */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">Total Orders</h2>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  (data?.orders?.growth || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(data?.orders?.growth || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.orders?.growth || 0).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">
                  {data?.orders?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {timeFrame === '7days' ? 'Past 7 days' :
                   timeFrame === '30days' ? 'Past 30 days' :
                   timeFrame === '90days' ? 'Past 90 days' : 'Past year'}
                </p>
              </div>
            </div>
            
            {/* Products */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">Total Products</h2>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">
                  {data?.products?.total || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data?.products?.published || 0} published
                </p>
              </div>
            </div>
            
            {/* Out of Stock */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-500">Out of Stock</h2>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">
                  {data?.products?.outOfStock || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data?.products?.outOfStock > 0 ? 'Needs attention' : 'All products in stock'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sales Chart */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Sales Performance</h2>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-80">
                {salesChartData && salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#8884d8" 
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#82ca9d" 
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') return formatCurrency(value);
                          return value;
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#82ca9d"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No sales data available for the selected period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Top Products & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Products */}
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Top Products</h2>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {data?.topProducts && data.topProducts.length > 0 ? (
                  <>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.topProducts.map((product, index) => (
                        <tr key={product.id || index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={product.image || 'https://via.placeholder.com/40'}
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    
                    {/* Pagination for Products */}
                    {pagination?.products?.total > 1 && (
                      <div className="py-3 px-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{data.topProducts.length}</span> of{' '}
                            <span className="font-medium">{pagination.products.count || 0}</span> products
                          </p>
                        </div>
                        <Pagination
                          currentPage={pagination.products.current || 1}
                          totalPages={pagination.products.total || 1}
                          onPageChange={handleProductsPageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No top products data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Revenue by Category */}
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue by Category</h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="h-80">
                  {categoryChartData && categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)} 
                          labelFormatter={(label) => `Category: ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          name="Revenue" 
                          fill="#8884d8" 
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No category data available</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination for Categories */}
                {pagination?.categories?.total > 1 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{categoryChartData.length}</span> of{' '}
                        <span className="font-medium">{pagination.categories.count || 0}</span> categories
                      </p>
                    </div>
                    <Pagination
                      currentPage={pagination.categories.current || 1}
                      totalPages={pagination.categories.total || 1}
                      onPageChange={handleCategoriesPageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorAnalytics; 