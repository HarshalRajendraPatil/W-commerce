import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { FiDollarSign, FiShoppingCart, FiPackage, FiBarChart2 } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartWrapper from '../ChartWrapper';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryStats = ({ categoryId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/categories/${categoryId}/stats`);
        setStats(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load category statistics');
        toast.error('Failed to load category statistics');
      } finally {
        setLoading(false);
      }
    };
    
    if (categoryId) {
      fetchCategoryStats();
    }
  }, [categoryId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-md">
        <p className="text-red-500">
          {error || 'Failed to load category statistics'}
        </p>
      </div>
    );
  }
  
  // Handle empty or missing data
  const safeStats = {
    stats: {
      sales: stats.stats?.sales || 0,
      orders: stats.stats?.orders || 0,
      productCount: stats.stats?.productCount || 0,
      averagePrice: stats.stats?.averagePrice || 0,
      itemsSold: stats.stats?.itemsSold || 0
    },
    monthlyTrends: stats.monthlyTrends || [],
    topProducts: stats.topProducts || [],
    recentOrders: stats.recentOrders || []
  };
  
  // Prepare chart data
  const chartData = {
    labels: safeStats.monthlyTrends.map(item => item._id),
    datasets: [
      {
        label: 'Sales ($)',
        data: safeStats.monthlyTrends.map(item => item.sales),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
      },
      {
        label: 'Units Sold',
        data: safeStats.monthlyTrends.map(item => item.count),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Sales Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  
  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-transparent text-indigo-600">
              <FiDollarSign className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${safeStats.stats.sales.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiShoppingCart className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {safeStats.stats.orders}
              </p>
            </div>
          </div>
        </div>
        
        {/* Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FiPackage className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {safeStats.stats.productCount}
              </p>
            </div>
          </div>
        </div>
        
        {/* Average Price */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiBarChart2 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Price</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${safeStats.stats.averagePrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sales Trend Chart */}
      {safeStats.monthlyTrends.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sales Trends
          </h3>
          <div className="h-72">
            <ChartWrapper>
              <Bar data={chartData} options={chartOptions} />
            </ChartWrapper>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Trends</h3>
          <p className="text-gray-500">No sales data available for this category yet</p>
        </div>
      )}
      
      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Selling Products
          </h3>
          {safeStats.topProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {safeStats.topProducts.map((product) => (
                <li key={product._id} className="py-4 flex">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      className="h-10 w-10 rounded-md object-cover"
                      src={product.images[0].url}
                      alt={product.name}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                  )}
                  <div className="ml-3 w-full">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        Sold: {product.soldCount || 0}
                      </p>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-500 ml-1">
                          {product.averageRating ? product.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No products found</p>
          )}
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Orders
          </h3>
          {safeStats.recentOrders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {safeStats.recentOrders.map((order) => (
                <li key={order._id} className="py-4">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">#{order.trackingNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      {order.user ? order.user.name : 'Guest'}
                    </p>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'delivered' || order.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        ${order.totalPrice?.toFixed(2) || 0}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent orders found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryStats; 