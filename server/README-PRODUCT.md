# W-Commerce Product Management

This document describes the product management features of the W-Commerce platform.

## Product Features

The product management system includes:

- Complete CRUD operations for products
- Product categorization
- Product image uploads
- Product filtering and search
- Featured and top-rated products
- Related products

## API Endpoints

### Products

- `GET /api/products` - Get all products with pagination, filtering, and sorting
- `GET /api/products/:id` - Get a single product by ID or slug
- `POST /api/products` - Create a new product (Admin/Vendor only)
- `PUT /api/products/:id` - Update a product (Admin/Vendor only)
- `DELETE /api/products/:id` - Delete a product (Admin/Vendor only)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/top-rated` - Get top-rated products
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/search` - Search for products
- `GET /api/products/:id/reviews` - Get product reviews
- `GET /api/products/:id/related` - Get related products

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category by ID or slug
- `POST /api/categories` - Create a new category (Admin only)
- `PUT /api/categories/:id` - Update a category (Admin only)
- `DELETE /api/categories/:id` - Delete a category (Admin only)
- `GET /api/categories/featured` - Get featured categories

### Image Uploads

- `POST /api/uploads/products/:id` - Upload product images (Admin/Vendor only)
- `PUT /api/uploads/products/:id/primary/:imageId` - Set a product image as primary (Admin/Vendor only)
- `DELETE /api/uploads/products/:id/images/:imageId` - Delete a product image (Admin/Vendor only)

## Product Model

The Product model includes the following fields:

- `name` - Product name
- `slug` - URL-friendly version of the name
- `description` - Product description
- `price` - Product price
- `discountPercentage` - Discount percentage (0-100)
- `images` - Array of product images
- `category` - Product category
- `subcategory` - Product subcategory
- `variants` - Product variants with different options
- `stockCount` - Number of items in stock
- `sku` - Stock Keeping Unit
- `brand` - Product brand
- `featured` - Whether the product is featured
- `published` - Whether the product is published
- `seller` - Product seller (User reference)
- `averageRating` - Average product rating (0-5)
- `numReviews` - Number of product reviews
- `specifications` - Product specifications
- `tags` - Product tags

## Category Model

The Category model includes the following fields:

- `name` - Category name
- `slug` - URL-friendly version of the name
- `description` - Category description
- `image` - Category image
- `parent` - Parent category
- `level` - Category level in hierarchy
- `isActive` - Whether the category is active
- `order` - Display order
- `featured` - Whether the category is featured

## Usage Examples

### Creating a Product

```javascript
// Example POST request to create a product
const productData = {
  name: "Sample Product",
  description: "This is a sample product",
  price: 99.99,
  category: "categoryId",
  stockCount: 100,
  brand: "Sample Brand"
};

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(productData)
});
```

### Uploading Product Images

```javascript
// Example of uploading product images
const formData = new FormData();
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await fetch(`/api/uploads/products/${productId}`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

### Filtering Products

```javascript
// Example of filtering products
const filters = {
  category: 'electronics',
  minPrice: 50,
  maxPrice: 200,
  sort: '-createdAt'
};

const queryString = new URLSearchParams(filters).toString();
const response = await fetch(`/api/products?${queryString}`);
``` 