const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p 
                className={`ml-2 text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 
                  changeType === 'decrease' ? 'text-red-600' : 
                  'text-gray-500'
                }`}
              >
                {changeType === 'increase' && '↑'}
                {changeType === 'decrease' && '↓'}
                {change}
              </p>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-md ${
          title.includes('Revenue') ? 'bg-green-100' : 
          title.includes('Orders') ? 'bg-blue-100' : 
          title.includes('Products') ? 'bg-purple-100' : 
          title.includes('Review') ? 'bg-yellow-100' : 
          'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 