const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fileUpload = require('express-fileupload');
const { errorHandler } = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/uploads', require('./routes/upload.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/vendor-applications', require('./routes/vendorApplication.routes'));
app.use('/api/stats', require('./routes/stats.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to W-commerce API' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 