import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDashboardStats,
  getSalesStats,
  getTopProducts,
  getRecentOrders
} from '../../redux/slices/dashboardSlice';

// Components
import StatCard from '../../components/admin/StatCard';
import SalesChart from '../../components/admin/SalesChart';
import TopProducts from '../../components/admin/TopProducts';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';

// Mock data for fallbacks
const mockStats = {
  totalRevenue: 152495.75,
  orderCount: 1254,
  productCount: 386,
  userCount: 2150,
  todayRevenue: 3245.50,
  todayOrders: 42,
  pendingOrders: 18
};

const mockSalesData = [
  { date: 'Jan 1', revenue: 1200, orders: 10 },
  { date: 'Jan 2', revenue: 1800, orders: 15 },
  { date: 'Jan 3', revenue: 1500, orders: 12 },
  { date: 'Jan 4', revenue: 2100, orders: 18 },
  { date: 'Jan 5', revenue: 1700, orders: 14 },
  { date: 'Jan 6', revenue: 2400, orders: 20 },
  { date: 'Jan 7', revenue: 2000, orders: 17 }
];

const mockTopProducts = [
  { _id: '1', name: 'Smartphone X', totalSales: 12500, unitsSold: 25 },
  { _id: '2', name: 'Wireless Headphones', totalSales: 8750, unitsSold: 35 },
  { _id: '3', name: 'Smart Watch', totalSales: 6300, unitsSold: 18 },
  { _id: '4', name: 'Laptop Pro', totalSales: 18900, unitsSold: 9 },
  { _id: '5', name: 'Bluetooth Speaker', totalSales: 4500, unitsSold: 30 }
];

const mockRecentOrders = [
  { 
    _id: '1', 
    orderNumber: 'ORD-001', 
    customer: { name: 'John Doe', email: 'john@example.com' },
    totalAmount: 1249.99,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  { 
    _id: '2', 
    orderNumber: 'ORD-002',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    totalAmount: 449.95,
    status: 'processing',
    createdAt: new Date(Date.now() - 43200000) // 12 hours ago
  },
  { 
    _id: '3', 
    orderNumber: 'ORD-003',
    customer: { name: 'Robert Johnson', email: 'robert@example.com' },
    totalAmount: 79.99,
    status: 'shipped',
    createdAt: new Date(Date.now() - 21600000) // 6 hours ago
  },
  { 
    _id: '4', 
    orderNumber: 'ORD-004',
    customer: { name: 'Emily Williams', email: 'emily@example.com' },
    totalAmount: 299.99,
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000) // 2 hours ago
  },
  { 
    _id: '5', 
    orderNumber: 'ORD-005',
    customer: { name: 'Michael Brown', email: 'michael@example.com' },
    totalAmount: 159.95,
    status: 'processing',
    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
  }
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, salesData, topProducts, recentOrders, loading, error } = useSelector(
    (state) => state.dashboard
  );
  const [timeFilter, setTimeFilter] = useState('30days');

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getSalesStats(timeFilter));
    dispatch(getTopProducts(5));
    dispatch(getRecentOrders(5));
  }, [dispatch, timeFilter]);

  // Handle period change for sales chart
  const handlePeriodChange = (period) => {
    setTimeFilter(period);
  };

  // Format numbers with comma separators
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '$0.00';
  };

  // Use the actual data or fall back to mock data if not available
  const displayStats = stats || mockStats;
  const displaySalesData = salesData?.length > 0 ? salesData : mockSalesData;
  const displayTopProducts = topProducts?.length > 0 ? topProducts : mockTopProducts;
  const displayRecentOrders = recentOrders?.length > 0 ? recentOrders : mockRecentOrders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your admin dashboard. Here's what's happening with your store today.
        </p>
      </div>

      {loading && <p className="text-center text-gray-500">Loading dashboard data...</p>}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          {error && <p className="text-sm text-gray-700 mt-2">Showing mock data as fallback.</p>}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(displayStats.totalRevenue)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-indigo-500"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(displayStats.orderCount)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(displayStats.productCount)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(displayStats.userCount)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(displayStats.todayRevenue)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          color="bg-amber-500"
        />
        <StatCard
          title="Today's Orders"
          value={formatNumber(displayStats.todayOrders)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Orders"
          value={formatNumber(displayStats.pendingOrders)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-orange-500"
        />
      </div>

      {/* Charts and data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart 
          salesData={displaySalesData} 
          timeFilter={timeFilter}
          onPeriodChange={handlePeriodChange}
        />
        <TopProducts products={displayTopProducts} />
      </div>

      {/* Recent orders */}
      <div>
        <RecentOrdersTable orders={displayRecentOrders} />
      </div>
    </div>
  );
};

export default Dashboard; 