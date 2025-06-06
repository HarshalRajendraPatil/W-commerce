# W-Commerce Backend: Order and Review System

## Overview

The W-Commerce backend implements a comprehensive order and review management system with advanced features for e-commerce operations.

## Order Management System

### Order Model

The order system uses a robust data model with the following key components:

- User reference (who placed the order)
- Order items (products, quantities, prices)
- Shipping and billing addresses
- Payment details (method, status)
- Order status with history tracking
- Price calculations (items, tax, shipping, discounts)
- Coupon integration
- Tracking information

### Order Features

- **Order Creation**: Create orders with product validation and inventory checks
- **Payment Processing**: Integration with Razorpay for secure payments
- **Order Tracking**: Track orders with unique tracking numbers
- **Status Management**: Comprehensive order lifecycle management
- **Cancellation & Refunds**: Process for order cancellations and refunds
- **Analytics**: Detailed order analytics for business insights
- **Role-Based Access**: Different capabilities for customers, vendors, and admins

### Order API Endpoints

#### Public Endpoints
None by default (tracking was moved to protected routes)

#### Customer Endpoints
- `POST /api/orders` - Create a new order
- `GET /api/orders/my-orders` - Get all orders for logged-in user
- `GET /api/orders/:id` - Get single order details
- `GET /api/orders/:id/payment-status` - Check payment status
- `POST /api/orders/payment` - Process payment
- `POST /api/orders/create-razorpay-order` - Create Razorpay order
- `POST /api/orders/:id/cancel` - Cancel an order
- `GET /api/orders/track/:trackingNumber` - Track an order by tracking number

#### Admin/Vendor Endpoints
- `GET /api/orders` - Get all orders (filtered by vendor products for vendors)
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/analytics` - Get order analytics (admin only)

## Review Management System

### Review Model

The review system uses a feature-rich data model with:

- User reference (reviewer)
- Product reference
- Rating (1-5)
- Title and comment
- Image uploads
- Verified purchase flag
- Approval status
- Likes counter and users who liked

### Review Features

- **Review Creation**: Submit product reviews with ratings, comments, and images
- **Verified Purchases**: Special identification for reviews from verified buyers
- **Moderation System**: Review approval workflow for quality control
- **Image Uploads**: Support for multiple images per review
- **Social Features**: Like/unlike functionality
- **Analytics**: Detailed review metrics for products and overall store
- **Role-Based Access**: Different capabilities for customers and admins

### Review API Endpoints

#### Public Endpoints
- `GET /api/reviews` - Get all approved reviews
- `GET /api/reviews/:id` - Get a single review

#### Customer Endpoints
- `POST /api/reviews` - Create a new review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review
- `POST /api/reviews/:id/like` - Like/unlike a review

#### Admin Endpoints
- `PUT /api/reviews/:id/approve` - Approve a review
- `PUT /api/reviews/:id/reject` - Reject a review
- `GET /api/reviews/analytics/products/:productId` - Get review analytics for a product
- `GET /api/reviews/analytics/overview` - Get overall review analytics

## Business Logic Highlights

### Order Processing

1. **Cart Validation**: Checks product availability and stock before order creation
2. **Coupon Application**: Validates and applies discount coupons
3. **Tax Calculation**: Applies appropriate tax rates
4. **Shipping Logic**: Determines shipping costs (free shipping over $100)
5. **Inventory Management**: Automatically updates product stock levels
6. **Payment Integration**: Secure payment processing with Razorpay
7. **Status Tracking**: Comprehensive order status history

### Review Management

1. **Purchase Verification**: Checks if user has purchased the product
2. **Auto-Approval**: Automatically approves reviews from verified purchases
3. **Moderation Queue**: Review workflow for non-verified purchases
4. **Rating Aggregation**: Automatically calculates and updates product ratings
5. **Image Processing**: Handles review image uploads
6. **Social Engagement**: Like/unlike functionality with user tracking

## Security Features

- JWT Authentication for all protected routes
- Role-based access control
- Payment verification using cryptographic signatures
- Order ownership validation
- Review ownership validation 