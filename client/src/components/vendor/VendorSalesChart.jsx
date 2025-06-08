import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorSalesStats } from '../../redux/slices/dashboardSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VendorSalesChart = () => {
  const dispatch = useDispatch();
  const { salesData, isLoading } = useSelector((state) => state.dashboard);
  const [period, setPeriod] = useState('month'); // Default to month view

  useEffect(() => {
    dispatch(getVendorSalesStats(period));
  }, [dispatch, period]);

  // Process data for chart
  const chartData = {
    labels: salesData?.data?.map(item => {
      // Format the date based on the period
      const date = new Date(item.date);
      if (period === 'week') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'month') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'year') {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
      return item.date;
    }) || [],
    datasets: [
      {
        label: 'Revenue',
        data: salesData?.data?.map(item => item.revenue) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: salesData?.data?.map(item => item.orders) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Orders'
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              period === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              period === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1 rounded-md text-sm ${
              period === 'year'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="h-64">
          {salesData?.data?.length > 0 ? (
            <Line options={chartOptions} data={chartData} />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No sales data available for this period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSalesChart; 