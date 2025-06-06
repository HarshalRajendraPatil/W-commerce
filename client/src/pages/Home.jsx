import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import ProductCard from '../components/product/ProductCard';
import productService from '../api/productService';
import categoryService from '../api/categoryService';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
  // States for various sections
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Hard-coded deals data (would typically come from backend)
  const deals = [
    {
      id: 1,
      title: 'Summer Sale',
      discount: 'Up to 50% Off',
      description: 'Get ready for summer with our hottest deals on seasonal items.',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      link: '/products?discount=true'
    },
    {
      id: 2,
      title: 'New Season',
      discount: 'Fresh Arrivals',
      description: 'Discover our new collection of trendy products just for you.',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800',
      buttonColor: 'bg-emerald-500 hover:bg-emerald-600',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      link: '/products?sort=-createdAt'
    },
    {
      id: 3,
      title: 'Limited Offers',
      discount: '24 Hours Only',
      description: 'Flash deals that won\'t last. Grab them before they\'re gone!',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      link: '/products?limit=true'
    }
  ];
  
  // Hard-coded testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      text: 'W-Commerce has transformed my online shopping experience. The quality of products and the seamless checkout process make this my go-to e-commerce platform!'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Verified Buyer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      text: 'I\'ve been shopping online for years, and W-Commerce provides the best user experience by far. Their customer service is exceptional, and delivery is always on time.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Premium Member',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      text: 'The product selection at W-Commerce is unmatched. I love discovering new brands and items that I can\'t find anywhere else. Highly recommended!'
    }
  ];
  
  // Hard-coded brands data
  const brands = [
    { id: 1, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png' },
    { id: 2, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/202px-Apple_logo_black.svg.png' },
    { id: 3, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png' },
    { id: 4, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/1600px-Sony_logo.svg.png' },
    { id: 5, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png' },
    { id: 6, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/200px-Microsoft_logo_%282012%29.svg.png' }
  ];
  
  // Hard-coded hero slides
  const heroSlides = [
    {
      id: 1,
      title: 'Summer Collection 2024',
      subtitle: 'New Arrivals',
      description: 'Discover our latest collection of summer products, designed for your comfort and style.',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      buttonText: 'Shop Now',
      buttonLink: '/products?tag=summer',
      align: 'left',
      theme: 'light'
    },
    {
      id: 2,
      title: 'Tech Gadgets',
      subtitle: 'Latest Innovation',
      description: 'Explore the cutting-edge technology that will transform your daily life.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      buttonText: 'Discover',
      buttonLink: '/categories/electronics',
      align: 'right',
      theme: 'dark'
    },
    {
      id: 3,
      title: 'Premium Deals',
      subtitle: 'Limited Time Offer',
      description: 'Up to 50% off on premium brands. Don\'t miss out on our exclusive collection.',
      image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
      buttonText: 'Shop Sale',
      buttonLink: '/products?discount=true',
      align: 'center',
      theme: 'light'
    }
  ];
  
  // Fetch products and categories
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data in parallel for better performance
        const [featuredProductsRes, topRatedProductsRes, featuredCategoriesRes, newArrivalsRes] = await Promise.all([
          productService.getFeaturedProducts(8),
          productService.getTopRatedProducts(8),
          categoryService.getFeaturedCategories(6),
          productService.getProducts({ sort: '-createdAt', limit: 8 })
        ]);
        
        setFeaturedProducts(featuredProductsRes.data);
        setTopRatedProducts(topRatedProductsRes.data);
        setFeaturedCategories(featuredCategoriesRes.data);
        setNewArrivals(newArrivalsRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setError('Failed to load some content. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);
  
  // Newsletter form state and handler
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Would typically call an API to handle the subscription
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };
  
  return (
    <div className="bg-gray-50">
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={true}
          className="h-[600px]"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full">
                <div className="absolute inset-0">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="h-full w-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-transparent opacity-${slide.theme === 'dark' ? '50' : '30'}`}></div>
                </div>
                
                <div className={`relative h-full flex items-center container mx-auto px-4 ${
                  slide.align === 'left' ? 'justify-start text-left' : 
                  slide.align === 'right' ? 'justify-end text-right' : 
                  'justify-center text-center'
                }`}>
                  <div className="max-w-xl">
                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${
                      slide.theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                    }`}>{slide.subtitle}</span>
                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
                      slide.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{slide.title}</h1>
                    <p className={`text-lg mb-8 ${
                      slide.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>{slide.description}</p>
                    <Link 
                      to={slide.buttonLink} 
                      className={`inline-block px-8 py-3 rounded-md font-semibold transition-colors ${
                        slide.theme === 'dark' ? 
                        'bg-white text-gray-900 hover:bg-gray-100' : 
                        'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      
      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            >
              {featuredCategories.length > 0 ? (
                featuredCategories.map((category) => (
                  <motion.div key={category._id} variants={fadeInUp}>
                    <Link 
                      to={`/categories/${category._id}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-square mb-3 relative">
                        {category.image?.url ? (
                          <img
                            src={category.image.url}
                            alt={category.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-center font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {category.name}
                      </h3>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // Placeholder categories if none are returned from API
                Array.from({ length: 6 }, (_, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <div className="block group">
                      <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden aspect-square mb-3 animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Special Deals */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Special Offers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`${deal.bgColor} rounded-xl overflow-hidden shadow-md`}
              >
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${deal.textColor}`}>{deal.title}</h3>
                  <p className="text-2xl font-extrabold mb-4">{deal.discount}</p>
                  <p className="text-gray-700 mb-6">{deal.description}</p>
                  <Link 
                    to={deal.link} 
                    className={`inline-block px-6 py-2 rounded-md text-white font-medium ${deal.buttonColor}`}
                  >
                    Shop Now
                  </Link>
                </div>
                <div className="relative h-48">
                  <img 
                    src={deal.image}
                    alt={deal.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No featured products available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Full-width Banner */}
      <section className="py-16 bg-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
          </svg>
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-800 text-indigo-100 text-sm font-semibold mb-4">Limited Time Offer</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Summer Season Sale</h2>
            <p className="text-xl text-indigo-200 mb-8">Get up to 50% off on selected items. Hurry, offer ends soon!</p>
            <Link 
              to="/products?discount=true" 
              className="inline-block px-8 py-3 rounded-md bg-white text-indigo-700 hover:bg-gray-100 font-semibold transition-colors"
            >
              Shop the Sale
            </Link>
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">New Arrivals</h2>
            <Link to="/products?sort=-createdAt" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              className="product-swiper"
            >
              {newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="text-center py-12">
                    <p className="text-gray-500">No new arrivals available at the moment.</p>
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>
      
      {/* Top Rated Products */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Top Rated Products</h2>
            <Link to="/products?sort=-averageRating" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View All <span className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRatedProducts.length > 0 ? (
                topRatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No top rated products available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{testimonial.text}</p>
                <div className="mt-4 flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Brand Showcase */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Shop by Brand</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.name}`}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="max-h-12 max-w-full grayscale hover:grayscale-0 transition-all"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-16 bg-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-indigo-200 mb-8">Get the latest updates on new products and special promotions.</p>
            
            {subscribed ? (
              <div className="bg-indigo-800 rounded-md p-4">
                <p className="text-indigo-100">Thank you for subscribing to our newsletter!</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-md bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      
      {/* Shopping Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $50</p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated customer service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 