import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWishlist, removeFromWishlist, clearWishlist } from '../../redux/slices/wishlistSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import ProductCard from '../../components/product/ProductCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { wishlist, loading } = useSelector(state => state.wishlist);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist());
    } else {
      navigate('/login', { state: { from: '/wishlist' } });
    }
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };
  
  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };
  
  const handleAddToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success('');
      })
      .catch((error) => {
        toast.error(error || 'Failed to add item to cart');
      });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Discover products you love and add them to your wishlist.</p>
          <Link
            to="/products"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <button
          onClick={handleClearWishlist}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Clear Wishlist
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.products.map((product) => (
          <div key={product._id} className="relative">
            <ProductCard product={product} />
            
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
              <button
                onClick={() => handleRemoveFromWishlist(product._id)}
                className="p-2 bg-white rounded-full shadow-md text-red-600 hover:text-red-800"
                title="Remove from wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handleAddToCart(product._id)}
                className="p-2 bg-white rounded-full shadow-md text-indigo-600 hover:text-indigo-800"
                title="Add to cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage; 