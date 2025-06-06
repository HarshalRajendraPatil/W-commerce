import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../../redux/slices/wishlistSlice';
import { useEffect } from 'react';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { inWishlist } = useSelector(state => state.wishlist);
  const { cart } = useSelector(state => state.cart);
  
  // Check if product is in cart
  const isInCart = cart?.items?.some(item => item.product._id === product._id);
  const cartItem = cart?.items?.find(item => item.product._id === product._id);
  
  // Get primary image or first image
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  
  // Calculate sale price if there's a discount
  const salePrice = product.discountPercentage > 0
    ? product.price * (1 - product.discountPercentage / 100)
    : null;
  
  // Check if product is in wishlist
  useEffect(() => {
    if (isAuthenticated && product._id) {
      dispatch(checkInWishlist(product._id));
    }
  }, [dispatch, isAuthenticated, product._id]);
  
  const handleCartAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (isInCart) {
      dispatch(removeFromCart(cartItem._id));
    } else {
      dispatch(addToCart({ 
        productId: product._id, 
        quantity: 1 
      }));
    }
  };
  
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (inWishlist[product._id]) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/products/${product._id}`} className="block relative pb-[100%]">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        
        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </span>
        )}
      </Link>
      
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link 
            to={`/categories/${product.category._id}`}
            className="text-xs text-indigo-600 uppercase tracking-wider mb-1 block"
          >
            {product.category.name}
          </Link>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing */}
        <div className="flex items-center">
          {salePrice ? (
            <>
              <span className="font-bold text-lg text-indigo-600 mr-2">
                ${salePrice.toFixed(2)}
              </span>
              <span className="text-gray-500 line-through text-sm">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg text-indigo-600">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${
                  index < Math.round(product.averageRating || 0)
                    ? 'text-yellow-500'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews || 0} reviews)
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={handleCartAction}
            className={`flex-1 py-2 px-4 rounded-md ${
              isInCart 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors`}
            disabled={product.stockCount <= 0}
          >
            {product.stockCount <= 0 
              ? 'Out of Stock'
              : isInCart 
                ? 'Remove from Cart' 
                : 'Add to Cart'
            }
          </button>
          <button 
            onClick={handleToggleWishlist}
            className={`p-2 rounded-md border ${
              inWishlist[product._id] 
                ? 'text-red-500 border-red-300 hover:bg-red-50' 
                : 'text-gray-500 border-gray-300 hover:text-red-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 