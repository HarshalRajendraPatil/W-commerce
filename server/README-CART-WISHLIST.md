# Cart and Wishlist API Documentation

This document provides information about the Cart and Wishlist APIs for the W-commerce platform.

## Base URL

```
/api
```

## Authentication

All cart and wishlist endpoints require authentication. Include a bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Cart API

### Get User's Cart

Retrieves the current user's cart or creates a new one if it doesn't exist.

**Endpoint:** `GET /api/cart`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8a9",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "items": [
      {
        "_id": "612c47e7c9e4f815b4c9e8aa",
        "product": {
          "_id": "612c47e7c9e4f815b4c9e8a7",
          "name": "Premium Headphones",
          "price": 199.99,
          "discountPercentage": 10,
          "images": [
            {
              "_id": "612c47e7c9e4f815b4c9e8a6",
              "url": "https://example.com/images/headphones.jpg",
              "isPrimary": true
            }
          ],
          "stockCount": 50
        },
        "quantity": 2,
        "price": 179.99,
        "selectedVariants": [
          {
            "name": "Color",
            "value": "Black"
          }
        ],
        "total": 359.98
      }
    ],
    "totalItems": 2,
    "totalPrice": 359.98,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Add Item to Cart

Adds a product to the user's cart or increments quantity if it already exists.

**Endpoint:** `POST /api/cart`

**Request Body:**
```json
{
  "productId": "612c47e7c9e4f815b4c9e8a7",
  "quantity": 1,
  "selectedVariants": [
    {
      "name": "Color",
      "value": "Black"
    },
    {
      "name": "Size",
      "value": "Medium"
    }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8a9",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "items": [
      {
        "_id": "612c47e7c9e4f815b4c9e8aa",
        "product": {
          "_id": "612c47e7c9e4f815b4c9e8a7",
          "name": "Premium Headphones",
          "price": 199.99,
          "discountPercentage": 10,
          "images": [
            {
              "_id": "612c47e7c9e4f815b4c9e8a6",
              "url": "https://example.com/images/headphones.jpg",
              "isPrimary": true
            }
          ],
          "stockCount": 50
        },
        "quantity": 1,
        "price": 179.99,
        "selectedVariants": [
          {
            "name": "Color",
            "value": "Black"
          },
          {
            "name": "Size",
            "value": "Medium"
          }
        ],
        "total": 179.99
      }
    ],
    "totalItems": 1,
    "totalPrice": 179.99,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Cart Item

Updates the quantity of an item in the cart.

**Endpoint:** `PUT /api/cart/items`

**Request Body:**
```json
{
  "itemId": "612c47e7c9e4f815b4c9e8aa",
  "quantity": 3
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8a9",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "items": [
      {
        "_id": "612c47e7c9e4f815b4c9e8aa",
        "product": {
          "_id": "612c47e7c9e4f815b4c9e8a7",
          "name": "Premium Headphones",
          "price": 199.99,
          "discountPercentage": 10,
          "images": [
            {
              "_id": "612c47e7c9e4f815b4c9e8a6",
              "url": "https://example.com/images/headphones.jpg",
              "isPrimary": true
            }
          ],
          "stockCount": 50
        },
        "quantity": 3,
        "price": 179.99,
        "selectedVariants": [
          {
            "name": "Color",
            "value": "Black"
          }
        ],
        "total": 539.97
      }
    ],
    "totalItems": 3,
    "totalPrice": 539.97,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Remove Item from Cart

Removes an item from the cart.

**Endpoint:** `DELETE /api/cart/items/:itemId`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8a9",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "items": [],
    "totalItems": 0,
    "totalPrice": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Clear Cart

Removes all items from the cart.

**Endpoint:** `DELETE /api/cart`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8a9",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "items": [],
    "totalItems": 0,
    "totalPrice": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Wishlist API

### Get User's Wishlist

Retrieves the current user's wishlist or creates a new one if it doesn't exist.

**Endpoint:** `GET /api/wishlist`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8b0",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "name": "My Wishlist",
    "products": [
      {
        "_id": "612c47e7c9e4f815b4c9e8a7",
        "name": "Premium Headphones",
        "price": 199.99,
        "discountPercentage": 10,
        "images": [
          {
            "_id": "612c47e7c9e4f815b4c9e8a6",
            "url": "https://example.com/images/headphones.jpg",
            "isPrimary": true
          }
        ],
        "averageRating": 4.5,
        "numReviews": 128,
        "stockCount": 50
      }
    ],
    "isPublic": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Add Product to Wishlist

Adds a product to the user's wishlist.

**Endpoint:** `POST /api/wishlist`

**Request Body:**
```json
{
  "productId": "612c47e7c9e4f815b4c9e8a7"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8b0",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "name": "My Wishlist",
    "products": [
      {
        "_id": "612c47e7c9e4f815b4c9e8a7",
        "name": "Premium Headphones",
        "price": 199.99,
        "discountPercentage": 10,
        "images": [
          {
            "_id": "612c47e7c9e4f815b4c9e8a6",
            "url": "https://example.com/images/headphones.jpg",
            "isPrimary": true
          }
        ],
        "averageRating": 4.5,
        "numReviews": 128,
        "stockCount": 50
      }
    ],
    "isPublic": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Check if Product is in Wishlist

Checks if a product is in the user's wishlist.

**Endpoint:** `GET /api/wishlist/check/:productId`

**Example Response:**
```json
{
  "success": true,
  "inWishlist": true
}
```

### Remove Product from Wishlist

Removes a product from the user's wishlist.

**Endpoint:** `DELETE /api/wishlist/:productId`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8b0",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "name": "My Wishlist",
    "products": [],
    "isPublic": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Clear Wishlist

Removes all products from the user's wishlist.

**Endpoint:** `DELETE /api/wishlist`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "612c47e7c9e4f815b4c9e8b0",
    "user": "612c47e7c9e4f815b4c9e8a8",
    "name": "My Wishlist",
    "products": [],
    "isPublic": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages in case of failure:

**Example Error Response:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

Common status codes:
- `400` - Bad request (missing required fields, invalid data)
- `401` - Unauthorized (missing or invalid token)
- `404` - Resource not found
- `500` - Server error 