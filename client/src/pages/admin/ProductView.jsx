import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, deleteProduct, toggleFeatured } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, isLoading, error } = useSelector((state) => state.product);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id));
      navigate('/admin/products');
      toast.success('Product deleted successfully');
    }
  };

  const handleToggleFeatured = async () => {
    await dispatch(toggleFeatured(id));
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Product Details</h1>
        <div className="flex space-x-4">
          <Link 
            to="/admin/products" 
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Products
          </Link>
          <button
            onClick={handleToggleFeatured}
            className={`px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white ${
              product.isFeatured ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Delete Product
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.name} 
                  className="w-full h-full object-center object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={`${product.name} - ${index + 2}`} 
                      className="w-full h-full object-center object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-gray-500">{product.category ? product.category.name : 'Uncategorized'}</p>
            </div>

            <div className="flex items-baseline">
              {product.discountPercentage > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ${((product.price * (100 - product.discountPercentage)) / 100).toFixed(2)}
                  </span>
                  <span className="ml-2 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Stock</h3>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                product.stockCount > 20 ? 'bg-green-100 text-green-800' : 
                product.stockCount > 10 ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {product.stockCount} in stock
              </span>
            </div>

            {product.isFeatured && (
              <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                Featured Product
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-2 prose prose-sm text-gray-500">
                <p>{product.description}</p>
              </div>
            </div>

            {product.specifications && product.specifications?.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
                <div className="mt-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {product.specifications.map((value, key) => (
                      <li key={key} className="text-sm text-gray-900">
                        {value.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p>No specifications available.</p>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-900">Product Statistics</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 px-4 py-2 rounded-md">
                  <p className="text-xs text-gray-500">Average Rating</p>
                  <p className="text-lg font-medium">
                    {product.averageRating ? (
                      <span className="flex items-center">
                        {product.averageRating.toFixed(1)}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                    ) : (
                      'No ratings yet'
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-md">
                  <p className="text-xs text-gray-500">Total Reviews</p>
                  <p className="text-lg font-medium">{product.numReviews || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView; 