# W-commerce Platform

## Profile Management System

The platform includes a comprehensive profile management system with role-specific pages for different user types:

### Backend Routes

#### Authentication & Profile Routes
- `GET /api/auth/profile` - Get user profile with role-specific data
- `PUT /api/auth/profile` - Update user profile information
- `PUT /api/auth/address` - Add or update user address
- `DELETE /api/auth/address/:id` - Delete user address

#### Customer-specific Routes
- `GET /api/orders/my-orders` - Get customer's order history
- `GET /api/reviews/my` - Get customer's product reviews
- `GET /api/wishlist` - Get customer's wishlist items

#### Vendor-specific Routes
- `GET /api/orders/vendor` - Get vendor's orders
- `GET /api/orders/vendor/sales` - Get vendor's sales statistics
- `GET /api/dashboard/vendor/stats` - Get vendor dashboard statistics
- `GET /api/dashboard/vendor/top-products` - Get vendor's top-selling products

#### Admin-specific Routes
- `GET /api/stats/system` - Get system-wide statistics

### Frontend Components

#### Shared Components
- `ProfileHeader` - Displays user information and allows editing
- `AddressManager` - Manages user addresses with CRUD operations
- `StatsCard` - Reusable card for displaying statistics

#### Role-specific Profile Pages
- `CustomerProfile` - For regular customers with orders, wishlist, reviews
- `VendorProfile` - For sellers with product management and sales analytics
- `AdminProfile` - For administrators with system statistics

#### Utilities
- `formatters.js` - Utility functions for formatting data (currency, dates, etc.)
- `axios.js` - Centralized API request configuration

## Setup Instructions

1. Clone the repository
2. Install dependencies
   ```
   cd W-commerce
   npm install
   cd client
   npm install
   ```
3. Configure environment variables
4. Start the backend server
   ```
   cd server
   npm run dev
   ```
5. Start the frontend application
   ```
   cd client
   npm run dev
   ``` 