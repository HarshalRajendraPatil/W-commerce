import { Link } from 'react-router-dom';

const TopProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
        <p className="text-gray-500">No product data available.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden border border-gray-200">
              {product.image && product.image.url ? (
                <img 
                  src={product.image.url} 
                  alt={product.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                <Link to={`/admin/products/${product._id}`} className="hover:underline">
                  {product.name}
                </Link>
              </h3>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-500">
                  {product.totalSold} sold
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ${product.revenue?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link
          to="/admin/products"
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          View all products
        </Link>
      </div>
    </div>
  );
};

export default TopProducts; 