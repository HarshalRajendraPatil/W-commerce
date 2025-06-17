import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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

const SalesChart = ({ salesData, timeFilter, onPeriodChange }) => {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Sales Overview</h2>
          <div className="space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => onPeriodChange('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === '30days' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => onPeriodChange('30days')}
            >
              Month
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'year' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => onPeriodChange('year')}
            >
              Year
            </button>
          </div>
        </div>
        <p className="text-gray-500">No sales data available.</p>
      </div>
    );
  }

  // Prepare chart data
  const labels = salesData.data.map(item => item.date);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: salesData.data.map(item => item.revenue),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: salesData.data.map(item => item.orders),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
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
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sales Overview</h2>
        <div className="space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
            onClick={() => onPeriodChange('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeFilter === '30days' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
            onClick={() => onPeriodChange('30days')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'year' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}
            onClick={() => onPeriodChange('year')}
          >
            Year
          </button>
        </div>
      </div>
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default SalesChart; 