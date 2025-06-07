# W-Commerce API Server

A robust e-commerce backend API built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Register, login, password reset
- **Product Management**: CRUD operations for products with image uploads
- **Category Management**: Organize products into categories
- **Cart Management**: Add, update, remove items from cart
- **Coupon System**: Create and apply discount coupons
- **Order Processing**: Place orders, track order status
- **Reviews & Ratings**: Product review system
- **Wishlist**: Save products for later
- **Admin Dashboard**: Manage products, orders, users

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication
- **Express-fileupload**: File upload handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone https://your-repository-url.git
cd w-commerce/server
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/items` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Coupons
- `GET /api/coupons` - Get all coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `GET /api/coupons/:id` - Get coupon by ID (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)
- `POST /api/coupons/apply` - Apply coupon to cart
- `DELETE /api/coupons/remove` - Remove coupon from cart

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (admin)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

## Error Handling

The API has consistent error handling with appropriate HTTP status codes and error messages.

## Security

- JWT based authentication
- Password hashing
- Route protection middleware
- Role-based access control

## Models

The database consists of the following models:

- User
- Product
- Category
- Cart
- Order
- Review
- Wishlist
- Coupon

## License

MIT 