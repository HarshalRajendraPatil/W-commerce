import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import productService from '../../api/productService';
import ProductCard from '../../components/product/ProductCard';
import ReviewSummary from '../../components/product/ReviewSummary';
import ReviewList from '../../components/product/ReviewList';
import ReviewForm from '../../components/product/ReviewForm';
import { addToCart, removeFromCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, checkInWishlist } from '../../redux/slices/wishlistSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { inWishlist } = useSelector(state => state.wishlist);
  const { cart } = useSelector(state => state.cart);
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Check if product is in cart
  const isInCart = cart?.items?.some(item => item.product._id === id);
  const cartItem = cart?.items?.find(item => item.product._id === id);
  
  // Fetch product and related products
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch product
        const productResponse = await productService.getProduct(id);
        setProduct(productResponse.data);
        
        // Set default selected image to primary or first image
        const primaryImage = productResponse.data.images?.find(img => img.isPrimary) || productResponse.data.images?.[0];
        setSelectedImage(primaryImage);
        
        // Set default selected variants
        const initialVariants = {};
        if (productResponse.data.variants && productResponse.data.variants.length > 0) {
          productResponse.data.variants.forEach(variant => {
            if (variant.options && variant.options.length > 0) {
              initialVariants[variant.name] = variant.options[0].value;
            }
          });
        }
        setSelectedVariants(initialVariants);
        
        // Fetch related products
        const relatedResponse = await productService.getRelatedProducts(id);
        setRelatedProducts(relatedResponse.data);
        
        // Check if product is in wishlist if user is authenticated
        if (isAuthenticated) {
          dispatch(checkInWishlist(id));
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError('Failed to fetch product data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id, dispatch, isAuthenticated]);
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockCount || 10)) {
      setQuantity(value);
    }
  };
  
  // Handle increment quantity
  const incrementQuantity = () => {
    if (quantity < (product?.stockCount || 10)) {
      setQuantity(quantity + 1);
    }
  };
  
  // Handle decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Handle variant selection
  const handleVariantChange = (variantName, optionValue) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantName]: optionValue
    });
  };
  
  // Handle cart action (add or remove)
  const handleCartAction = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    if (isInCart) {
      dispatch(removeFromCart(cartItem._id))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} removed from cart!`);
        })
        .catch((error) => {
          toast.error(error || 'Failed to remove item from cart');
        });
    } else {
      // Convert selected variants to array of objects
      const variantsArray = Object.entries(selectedVariants).map(([name, value]) => ({
        name,
        value
      }));
      
      dispatch(addToCart({
        productId: product._id,
        quantity,
        selectedVariants: variantsArray
      }))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} added to cart!`);
        })
        .catch((error) => {
          toast.error(error || 'Failed to add item to cart');
        });
    }
  };
  
  // Handle toggle wishlist
  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    if (inWishlist[product._id]) {
      dispatch(removeFromWishlist(product._id))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} removed from wishlist!`);
        })
        .catch((error) => {
          toast.error(error || 'Failed to remove from wishlist');
        });
    } else {
      dispatch(addToWishlist(product._id))
        .unwrap()
        .then(() => {
          toast.success(`${product.name} added to wishlist!`);
        })
        .catch((error) => {
          toast.error(error || 'Failed to add to wishlist');
        });
    }
  };
  
  // Calculate sale price if there's a discount
  const calculateSalePrice = () => {
    if (!product) return null;
    
    return product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : null;
  };
  
  const salePrice = calculateSalePrice();
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Product not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <Link to={`/categories/${product.category._id}`} className="hover:text-indigo-600">
              {product.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>
      
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 aspect-square">
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`bg-white rounded-md overflow-hidden aspect-square ${
                    selectedImage && selectedImage._id === image._id
                      ? 'ring-2 ring-indigo-500'
                      : 'border border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          {/* Product Name and Category */}
          <div className="mb-4">
            {product.category && (
              <Link
                to={`/categories/${product.category._id}`}
                className="text-sm text-indigo-600 uppercase tracking-wider mb-1 block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>
          
          {/* Price */}
          <div className="mb-4">
            {salePrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600 mr-2">
                  ${salePrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  {product.discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-5 h-5 ${
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
            <span className="text-sm text-gray-500 ml-2">
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} ({product.numReviews || 0} reviews)
            </span>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>
          
          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6 space-y-4">
              {product.variants.map((variant, variantIndex) => (
                <div key={variantIndex}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{variant.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleVariantChange(variant.name, option.value)}
                        className={`px-4 py-2 border rounded-md ${
                          selectedVariants[variant.name] === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : 'border-gray-300 text-gray-700 hover:border-indigo-300'
                        }`}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Quantity */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={decrementQuantity}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-l-md border border-gray-300 hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max={product.stockCount || 10}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center py-2 border-t border-b border-gray-300"
              />
              <button
                onClick={incrementQuantity}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-r-md border border-gray-300 hover:bg-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="ml-4 text-sm text-gray-500">
                {product.stockCount > 0 ? `${product.stockCount} available` : 'Out of stock'}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleCartAction}
              disabled={product.stockCount <= 0}
              className={`flex-1 py-3 px-6 rounded-md font-medium ${
                product.stockCount <= 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : isInCart
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
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
              className={`py-3 px-6 rounded-md border ${
                inWishlist[product._id]
                  ? 'bg-red-50 text-red-500 border-red-300 hover:bg-red-100'
                  : 'text-gray-700 border-gray-300 hover:text-red-500 hover:border-red-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 border-t border-gray-200 pt-4">
            <dl className="space-y-2">
              <div className="flex">
                <dt className="text-sm text-gray-500 w-24">SKU:</dt>
                <dd className="text-sm text-gray-900">{product.sku || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="text-sm text-gray-500 w-24">Brand:</dt>
                <dd className="text-sm text-gray-900">{product.brand || 'N/A'}</dd>
              </div>
              {product.seller && (
                <div className="flex">
                  <dt className="text-sm text-gray-500 w-24">Seller:</dt>
                  <dd className="text-sm text-gray-900">{product.seller.name}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
      
      {/* Product Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Specifications</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex">
                  <dt className="text-gray-500 w-1/3">{spec.name}:</dt>
                  <dd className="text-gray-900 w-2/3">{spec.value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="lg:col-span-1">
            <ReviewSummary productId={id} />
            
            {/* Add Review Button */}
            {user && (
              <div className="mt-6">
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
          
          {/* Review List or Form */}
          <div className="lg:col-span-2">
            {showReviewForm ? (
              <ReviewForm 
                productId={id} 
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <ReviewList productId={id} />
            )}
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail; 