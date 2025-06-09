import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';
import dashboardReducer from './slices/dashboardSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import vendorApplicationReducer from './slices/vendorApplicationSlice';
import vendorProductsReducer from './slices/vendorProductsSlice';
import vendorOrdersReducer from './slices/vendorOrdersSlice';
import vendorReviewsReducer from './slices/vendorReviewsSlice';
import vendorAnalyticsReducer from './slices/vendorAnalyticsSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    review: reviewReducer,
    dashboard: dashboardReducer,
    product: productReducer,
    category: categoryReducer,
    vendorApplication: vendorApplicationReducer,
    vendorProducts: vendorProductsReducer,
    vendorOrders: vendorOrdersReducer,
    vendorReviews: vendorReviewsReducer,
    vendorAnalytics: vendorAnalyticsReducer
  },
  devTools: import.meta.env.MODE !== 'production'
});

export default store; 