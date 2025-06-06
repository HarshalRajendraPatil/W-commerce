# W-Commerce Backend

A fully-featured REST API for an e-commerce platform built with Node.js, Express, and MongoDB.

## Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Email verification
- Password reset functionality
- User roles (customer, admin, vendor)
- User profile management
- Address management

### 🛒 Product Management
- Product listing with pagination, filtering, and search
- Product categories and subcategories
- Product variants (size, color, etc.)
- Product reviews and ratings
- Inventory management

### 🧺 Shopping Experience
- Shopping cart functionality
- Wishlist management
- Product comparison

### 💳 Checkout & Payments
- Order creation and management
- Payment processing (Stripe integration)
- Coupon system

### 📊 Admin Dashboard Endpoints
- User management
- Product/category management
- Order management
- Analytics endpoints

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/w-commerce.git
   cd w-commerce
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   
   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password
   
   # Stripe configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. Start the development server
   ```
   npm run dev
   ```

## API Documentation

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/update-password` - Update password
- `GET /api/auth/verify-email/:token` - Verify email

### User Routes
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/:addressId` - Update address
- `DELETE /api/users/addresses/:addressId` - Delete address
- `PUT /api/users/addresses/:addressId/default` - Set default address

### Product Routes
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (vendor/admin)
- `PUT /api/products/:id` - Update product (vendor/admin)
- `DELETE /api/products/:id` - Delete product (vendor/admin)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/top-rated` - Get top rated products
- `GET /api/products/search` - Search products
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/:id/reviews` - Get product reviews
- `GET /api/products/:id/related` - Get related products

### Category Routes
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)
- `GET /api/categories/:id/subcategories` - Get subcategories

### Cart Routes
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/apply-coupon` - Apply coupon

### Order Routes
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin/vendor)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (admin/vendor)
- `POST /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders/payment` - Process payment
- `GET /api/orders/:id/payment-status` - Get payment status
- `POST /api/orders/create-checkout-session` - Create checkout session

### Review Routes
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/approve` - Approve review (admin)
- `PUT /api/reviews/:id/reject` - Reject review (admin)
- `POST /api/reviews/:id/like` - Like review

### Wishlist Routes
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/add/:productId` - Add to wishlist
- `DELETE /api/wishlist/remove/:productId` - Remove from wishlist
- `DELETE /api/wishlist/clear` - Clear wishlist
- `GET /api/wishlist/:id` - Get wishlist by ID (public wishlist)

## License

This project is licensed under the MIT License 