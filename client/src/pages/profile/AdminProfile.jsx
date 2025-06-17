import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiPackage, FiDollarSign, FiShoppingBag, FiShield, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ProfileHeader from '../../components/profile/ProfileHeader';
import AddressManager from '../../components/profile/AddressManager';
import StatsCard from '../../components/profile/StatsCard';
import Loader from '../../components/common/Loader';
import userService from '../../api/userService';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminProfile = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  console.log("systemStats", systemStats);

  
  useEffect(() => {
    fetchProfileData();
  }, []);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const profileRes = await userService.getProfile();
      setProfile(profileRes.data);
      
      // Fetch system stats
      const statsRes = await userService.getSystemStats();
      setSystemStats(statsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!systemStats?.monthlyRegistrations) return null;

    const months = systemStats.monthlyRegistrations.map(item => item.month);
    const registrations = systemStats.monthlyRegistrations.map(item => item.count);

    return {
      labels: months,
      datasets: [
        {
          label: 'New Registrations',
          data: registrations,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };
  
  const handleProfileUpdate = (updatedUser) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...updatedUser
    }));
  };
  
  const handleAddressUpdate = (updatedUser) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      addresses: updatedUser.addresses
    }));
  };
  
  if (loading || !profile || !systemStats) {
    return <Loader />;
  }
  
  const chartData = getChartData();
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProfileHeader user={profile} onProfileUpdate={handleProfileUpdate} />
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'addresses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Addresses
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={systemStats.totalUsers}
              icon={<FiUsers className="h-6 w-6" />}
              color="blue"
            />
            <StatsCard
              title="Total Products"
              value={systemStats.totalProducts}
              icon={<FiPackage className="h-6 w-6" />}
              color="purple"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(systemStats.totalRevenue)}
              icon={<FiDollarSign className="h-6 w-6" />}
              color="green"
            />
            <StatsCard
              title="Total Orders"
              value={systemStats.totalOrders}
              icon={<FiShoppingBag className="h-6 w-6" />}
              color="yellow"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Customers</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">{systemStats.usersByRole.customer || 0}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((systemStats.usersByRole.customer / systemStats.totalUsers) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round((systemStats.usersByRole.customer / systemStats.totalUsers) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Vendors</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">{systemStats.usersByRole.vendor || 0}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((systemStats.usersByRole.vendor / systemStats.totalUsers) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round((systemStats.usersByRole.vendor / systemStats.totalUsers) * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Admins</span>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900 mr-2">{systemStats.usersByRole.admin || 0}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((systemStats.usersByRole.admin / systemStats.totalUsers) * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round((systemStats.usersByRole.admin / systemStats.totalUsers) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Active Users</span>
                  <span className="text-sm font-bold text-gray-900">
                    {systemStats.activeUsers} ({Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Inactive Users</span>
                  <span className="text-sm font-bold text-gray-900">
                    {systemStats.inactiveUsers} ({Math.round((systemStats.inactiveUsers / systemStats.totalUsers) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Registration</h2>
              
              <div className="h-60 mb-6">
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full bg-gray-50 rounded-md flex items-center justify-center">
                    <FiBarChart2 className="h-12 w-12 text-gray-400" />
                    <span className="ml-2 text-gray-500">No registration data available</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">This Month</span>
                  <span className="text-sm font-bold text-gray-900">{systemStats.registrationsThisMonth || 0} new users</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Month</span>
                  <span className="text-sm font-bold text-gray-900">{systemStats.registrationsLastMonth || 0} new users</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Growth Rate</span>
                  <span className={`text-sm font-bold ${systemStats.registrationGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStats.registrationGrowth >= 0 ? '+' : ''}{systemStats.registrationGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Customers</h2>
              <a
                href="/admin/customers"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View All Users
              </a>
            </div>
            
            {systemStats.topCustomers && systemStats.topCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {systemStats.topCustomers.map((customer) => (
                      <tr key={customer._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/admin/users/${customer._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No customer data available.</p>
            )}
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/customers"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <div className="flex-shrink-0 bg-blue-500 p-2 rounded-md">
                  <FiUsers className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-900">Manage Users</h3>
                  <p className="text-xs text-blue-700 mt-1">View and manage user accounts</p>
                </div>
              </Link>
              
              <Link
                to="/admin/settings"
                className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <div className="flex-shrink-0 bg-red-500 p-2 rounded-md">
                  <FiShield className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-red-900">Security Settings</h3>
                  <p className="text-xs text-red-700 mt-1">Manage system security settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'activity' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h2>
          
          {systemStats.recentActivity && systemStats.recentActivity.length > 0 ? (
            <div className="space-y-6">
              {systemStats.recentActivity.map((activity) => (
                <div key={activity._id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-md mr-4 ${
                      activity.type === 'user' ? 'bg-blue-100 text-blue-700' :
                      activity.type === 'product' ? 'bg-purple-100 text-purple-700' :
                      activity.type === 'order' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.type === 'user' ? <FiUsers className="h-5 w-5" /> :
                       activity.type === 'product' ? <FiPackage className="h-5 w-5" /> :
                       activity.type === 'order' ? <FiShoppingBag className="h-5 w-5" /> :
                       <FiBarChart2 className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-700">
                          {activity.user ? activity.user.name : 'System'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity found.</p>
          )}
        </div>
      )}
      
      {activeTab === 'addresses' && (
        <AddressManager 
          addresses={profile.addresses} 
          onAddressUpdate={handleAddressUpdate} 
        />
      )}
    </div>
  );
};

export default AdminProfile; 