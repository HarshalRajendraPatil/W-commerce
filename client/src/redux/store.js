import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import reviewReducer from './slices/reviewSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    review: reviewReducer
  },
  devTools: import.meta.env.MODE !== 'production'
});

export default store; 