# 🚀 CampusDeals API Endpoints Reference

## 📋 Base Configuration
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Bearer Token (`Authorization: Bearer <access_token>`)
- **Content-Type**: `application/json`
- **Database**: SQLite with Better-SQLite3

---

## 📍 Complete API Endpoints List

### 🔐 **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user (no predefined role) |
| `POST` | `/api/auth/signup` | Public | Alias for register |
| `POST` | `/api/auth/login` | Public | User authentication |
| `POST` | `/api/auth/logout` | Protected | Logout and invalidate tokens |
| `POST` | `/api/auth/refresh` | Public | Refresh access token |
| `GET` | `/api/auth/profile` | Protected | Get user profile |
| `POST` | `/api/auth/validate-transaction` | Protected | Validate user for transactions |

### 👥 **User Management Routes** (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/users` | Admin Only | Get all users list |
| `PUT` | `/api/users/:id` | Owner/Admin | Update user profile |
| `DELETE` | `/api/users/:id` | Admin Only | Delete user account |

### 📦 **Product Routes** (`/api/products`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/products` | Public | Get all products with inventory |
| `GET` | `/api/products/filter` | Public | Filter products by criteria |
| `GET` | `/api/products/:id` | Public | Get specific product details |
| `POST` | `/api/products` | Public | Create new product |
| `PUT` | `/api/products/:id` | Public | Update product information |
| `DELETE` | `/api/products/:id` | Public | Delete product |

### 🛒 **Shopping Cart Routes** (`/api/cart`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/cart/add` | Protected | Add item to cart (no stock validation) |
| `GET` | `/api/cart` | Protected | Get user's cart items |
| `PUT` | `/api/cart/update` | Protected | Update cart item quantity |
| `PUT` | `/api/cart/batch-update` | Protected | Update multiple cart items |
| `DELETE` | `/api/cart/remove/:productId` | Protected | Remove item from cart |
| `DELETE` | `/api/cart/batch-remove` | Protected | Remove multiple items |
| `DELETE` | `/api/cart/clear` | Protected | Clear entire cart |

### 📋 **Order Management Routes** (`/api/orders`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/orders/buy` | Protected | Create buy order with stock validation |
| `POST` | `/api/orders/sell` | Protected | Create sell order with serial generation |
| `GET` | `/api/orders/buy` | Protected | Get user's buy orders |
| `GET` | `/api/orders/sell` | Protected | Get user's sell orders |
| `GET` | `/api/orders/:orderId` | Owner/Admin | Get specific order details |
| `PUT` | `/api/orders/buy/:orderId` | Buyer/Admin | Update buy order |
| `PUT` | `/api/orders/sell/:orderId` | Seller/Admin | Update sell order |

---

## 🔍 **Detailed Endpoint Documentation**

### **1. User Registration**
```http
POST /api/auth/register
```
**Request:**
```json
{
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_password": "password123",
  "user_phone": "+1234567890",
  "user_studyyear": "2024",
  "user_branch": "Computer Science",
  "user_section": "A",
  "user_residency": "On-campus"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": null
  },
  "instructions": {
    "message": "Your role will be assigned automatically based on your first action (buy or sell)"
  }
}
```

### **2. User Login**
```http
POST /api/auth/login
```
**Request:**
```json
{
  "user_email": "john@example.com",
  "user_password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

### **3. Get All Products**
```http
GET /api/products
```
**Response:**
```json
[
  {
    "product_id": 1,
    "product_name": "drafter",
    "product_variant": "premium_drafter",
    "product_code": "DFT-P",
    "product_price": 50.00,
    "product_images": "image_url",
    "quantity": 15,
    "created_at": "2025-10-19T00:00:00Z",
    "updated_at": "2025-10-19T00:00:00Z"
  }
]
```

### **4. Add Item to Cart**
```http
POST /api/cart/add
Authorization: Bearer <access_token>
```
**Request:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart_id": 123,
    "product_id": 1,
    "quantity": 2,
    "total_quantity": 2
  }
}
```

### **5. Get Cart Items**
```http
GET /api/cart
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "cart_items": [
      {
        "cart_id": 123,
        "product_id": 1,
        "product_name": "drafter",
        "product_variant": "premium_drafter",
        "product_price": 50.00,
        "quantity": 2,
        "item_total": 100.00
      }
    ],
    "total_cost": 100.00,
    "total_items": 1
  }
}
```

### **6. Create Buy Order (With Stock Validation)**
```http
POST /api/orders/buy
Authorization: Bearer <access_token>
```
**Request:**
```json
{
  "cart_id": 123,
  "payment_method": "cash"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Buy order created successfully from cart",
  "data": {
    "buyer_id": 123,
    "cart_id": 123,
    "order": {
      "order_id": 456,
      "serial_no": "ORD-001",
      "total_amount": 100.00,
      "payment_method": "cash",
      "status": "pending",
      "items": [
        {
          "product_name": "drafter",
          "quantity": 2,
          "serial_numbers": ["DFT-P001", "DFT-P002"]
        }
      ],
      "total_items": 2
    }
  }
}
```

**Stock Validation Error:**
```json
{
  "success": false,
  "message": "Insufficient stock available for product DFT-P (requested: 5, available: 3)"
}
```

### **7. Create Sell Order (With Serial Generation)**
```http
POST /api/orders/sell
Authorization: Bearer <access_token>
```
**Request:**
```json
{
  "cart_id": 123,
  "payment_method": "cash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sell order created successfully from cart",
  "data": {
    "seller_id": 123,
    "cart_id": 123,
    "order": {
      "order_id": 789,
      "serial_no": "ORD-002",
      "total_amount": 150.00,
      "payment_method": "cash",
      "status": "pending",
      "items": [
        {
          "product_name": "drafter",
          "quantity": 3,
          "serial_numbers": ["DFT-P003", "DFT-P004", "DFT-P005"]
        }
      ],
      "total_items": 3
    }
  }
}
```

### **8. Get Buy Orders**
```http
GET /api/orders/buy?status=pending
Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "order_id": 456,
        "serial_no": "ORD-001",
        "quantity": 2,
        "total_amount": 100.00,
        "payment_method": "cash",
        "status": "pending",
        "created_at": "2025-10-19T10:30:00Z",
        "items": [
          {
            "product_id": 1,
            "product_name": "drafter",
            "product_variant": "premium_drafter",
            "quantity": 2,
            "price_per_item": 50.00,
            "item_total": 100.00,
            "serial_numbers": ["DFT-P001", "DFT-P002"]
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 **Key Features & Behaviors**

### **🏷️ Dynamic Role Assignment**
- **Registration**: Users register with `role: null`
- **First Buy Order**: Auto-assigns "buyer" role
- **First Sell Order**: Auto-assigns "seller" role
- **Role Switching**: Users can switch roles based on actions

### **📦 Serial Number Management**
- **Sell Orders**: Generate unique serials (`DFT-P001`, `DFT-P002`, etc.)
- **Buy Orders**: Allocate lowest available serials in ascending order
- **Format**: `<product_code><3-digit-sequence>`

### **💰 Stock Validation**
- **Cart Operations**: No stock validation (allow adding any quantity)
- **Buy Orders Only**: Strict stock validation before order creation
- **Error Handling**: Clear error messages for insufficient stock
- **Transaction Safety**: All operations within database transactions

### **🛡️ Authentication & Authorization**
- **JWT Tokens**: Access and refresh token system
- **Role-based Access**: Dynamic enforcement based on user roles
- **Protected Routes**: Require valid authentication tokens
- **Admin Access**: Special permissions for admin-only operations

---

## 📊 **Response Status Codes**

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Successful GET requests |
| `201` | Created | Successful POST requests |
| `400` | Bad Request | Invalid request data or validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `500` | Internal Server Error | Server-side errors |

---

## 🔧 **Query Parameters**

### **Products Filter**
- `product_name`: Filter by product name
- `product_variant`: Filter by variant
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter

### **Orders Filter**
- `status`: Filter by status (`pending`, `completed`, `cancelled`)

---

## 📝 **Standard Error Response Format**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)",
  "field": "specific_field_name (for validation errors)"
}
```

---

## 💡 **Usage Examples**

### **Frontend JavaScript Example**
```javascript
// Login and get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_email: 'john@example.com',
    user_password: 'password123'
  })
});
const loginData = await loginResponse.json();
const token = loginData.accessToken;

// Add item to cart
const cartResponse = await fetch('/api/cart/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 1,
    quantity: 2
  })
});

// Create buy order with stock validation
const orderResponse = await fetch('/api/orders/buy', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cart_id: 123,
    payment_method: 'cash'
  })
});
```

### **curl Example**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_email":"john@example.com","user_password":"password123"}'

# Get products
curl -X GET http://localhost:3000/api/products

# Add to cart (requires token)
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```

---

This comprehensive API reference provides all the endpoints, request/response formats, and usage examples for the CampusDeals marketplace platform with dynamic role assignment, serial number management, and inventory control features.