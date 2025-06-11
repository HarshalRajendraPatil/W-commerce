import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import authService from './api/authService';
import { getCart } from './redux/slices/cartSlice';
import { getWishlist } from './redux/slices/wishlistSlice';

// Layout components
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import VendorLayout from './components/vendor/VendorLayout';

// Page components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import CategoryList from './pages/category/CategoryList';
import CategoryDetail from './pages/category/CategoryDetail';
import CartPage from './pages/cart/CartPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import OrderSuccessPage from './pages/orders/OrderSuccessPage';
import TrackOrder from './pages/orders/TrackOrder';
import AboutPage from './pages/about/AboutPage';
import ContactPage from './pages/contact/ContactPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import Profile from './pages/profile/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import OrderView from './pages/admin/OrderView';
import Customers from './pages/admin/Customers';
import Coupons from './pages/admin/Coupons';
import Reviews from './pages/admin/Reviews';
import VendorApplications from './pages/admin/VendorApplications';
import ProductView from './pages/admin/ProductView';
import CategoryDetails from './pages/admin/CategoryDetails';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorOrderDetails from './pages/vendor/OrderDetails';
import VendorReviews from './pages/vendor/Reviews';
import VendorAnalytics from './pages/vendor/Analytics';
import AddProduct from './pages/vendor/AddProduct';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Vendor route component
const VendorRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated || (user?.role !== 'vendor' && user?.role !== 'admin')) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Check authentication status on app load
  useEffect(() => {
    const user = authService.getUser();
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } else if (isAuthenticated) {
      // If user is authenticated, load cart and wishlist data
      dispatch(getCart());
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Main layout routes */}
          <Route path="/" element={<MainLayout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/:id" element={<CategoryDetail />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            
            {/* Protected routes */}
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="cart" 
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="wishlist" 
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="orders" 
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="orders/:id" 
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="order-success/:id" 
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="orders/track/:trackingNumber" element={<TrackOrder />} />
            
            {/* Admin routes - redirects to admin layout */}
            <Route 
              path="admin/*" 
              element={
                <AdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </AdminRoute>
              } 
            />
            
            {/* Vendor routes - redirects to vendor layout */}
            <Route 
              path="vendor/*" 
              element={
                <VendorRoute>
                  <Navigate to="/vendor/dashboard" replace />
                </VendorRoute>
              } 
            />
            
            {/* 404 fallback for main layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Auth routes (outside main layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Admin Dashboard Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/details/:id" element={<CategoryDetails />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderView />} />
            <Route path="customers" element={<Customers />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="vendor-applications" element={<VendorApplications />} />
            <Route path="products/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductView />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Vendor Dashboard Layout */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<div>Edit Product (to be implemented)</div>} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="orders/:id" element={<VendorOrderDetails />} />
            <Route path="reviews" element={<VendorReviews />} />
            <Route path="analytics" element={<VendorAnalytics />} />
            <Route path="settings" element={<div>Settings (to be implemented)</div>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
