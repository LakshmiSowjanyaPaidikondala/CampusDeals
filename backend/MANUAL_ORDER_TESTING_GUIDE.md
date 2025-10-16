# Manual Order Endpoints Testing Guide

This guide provides manual step-by-step testing for the simplified cart-order connection using `cart_id` foreign key.

## Prerequisites
- Server running on http://localhost:5000
- Use any API testing tool (Thunder Client, Postman, or PowerShell)

---

## 🔐 Authentication Steps

### 1. Login as Buyer
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
    "user_email": "ravi@example.com",
    "user_password": "password123"
}
```
**Expected Response:**
```json
{
    "status": "success",
    "accessToken": "JWT_TOKEN_HERE",
    "user": {
        "userId": 3,
        "user_name": "Ravi Kumar",
        "role": "buyer"
    }
}
```
**Save:** `buyerToken` and `buyerId` for later use

### 2. Login as Seller
**Method:** POST  
**URL:** `http://localhost:5000/api/auth/login`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
    "user_email": "priya@example.com",
    "user_password": "password123"
}
```
**Expected Response:**
```json
{
    "status": "success",
    "accessToken": "JWT_TOKEN_HERE",
    "user": {
        "userId": 2,
        "user_name": "Priya Sharma",
        "role": "seller"
    }
}
```
**Save:** `sellerToken` for later use

---

## 📦 Sell Order Endpoints

### 3. Create Sell Order
**Method:** POST  
**URL:** `http://localhost:5000/api/orders/sell`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {sellerToken}`

**Body:**
```json
{
    "product_name": "calculator",
    "product_variant": "MS",
    "product_price": 1200,
    "quantity": 5,
    "product_images": "calculator_ms.jpg"
}
```
**Expected Response:**
```json
{
    "success": true,
    "message": "Sell order created successfully",
    "data": {
        "order_id": 1,
        "serial_no": "ORD-001",
        "order_type": "sell",
        "product_name": "calculator",
        "quantity": 5,
        "total_amount": 6000,
        "status": "pending"
    }
}
```

### 4. Get Sell Orders
**Method:** GET  
**URL:** `http://localhost:5000/api/orders/sell`  
**Headers:** `Authorization: Bearer {sellerToken}`  
**Expected:** List of seller's sell orders

---

## 🛒 Cart Setup

### 5. Add Item to Cart
**Method:** POST  
**URL:** `http://localhost:5000/api/cart`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {buyerToken}`

**Body:**
```json
{
    "product_id": 14,
    "quantity": 3
}
```
**Expected Response:**
```json
{
    "status": "success",
    "message": "Item added to cart successfully",
    "data": {
        "cart_id": 3,
        "product_id": 14,
        "quantity": 3
    }
}
```

### 6. View Cart
**Method:** GET  
**URL:** `http://localhost:5000/api/cart`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected:** Cart items with cart_id, product details, quantities

---

## 🛍️ Buy Order Endpoints (Cart-Order Connection)

### 7. Create Buy Order from Cart (Key Test!)
**Method:** POST  
**URL:** `http://localhost:5000/api/orders/buy`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {buyerToken}`

**Body:**
```json
{
    "cart_id": 3,
    "payment_method": "upi"
}
```
**Expected Response:**
```json
{
    "success": true,
    "message": "Buy order created successfully from cart",
    "data": {
        "buyer_id": 3,
        "cart_id": 3,
        "total_orders": 1,
        "orders": [
            {
                "order_id": 2,
                "serial_no": "ORD-002",
                "product_name": "calculator",
                "quantity": 3,
                "cart_id": 3,
                "total_amount": 3600,
                "status": "pending"
            }
        ]
    }
}
```

**Key Points to Verify:**
- ✅ `cart_id` field is populated in the order
- ✅ Order is created from all cart items
- ✅ Cart is cleared after order creation
- ✅ FIFO allocation works (seller's quantities reduced)

### 8. Verify Cart is Empty
**Method:** GET  
**URL:** `http://localhost:5000/api/cart`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected:** Empty cart (total_items: 0)

### 9. Get Buy Orders
**Method:** GET  
**URL:** `http://localhost:5000/api/orders/buy`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected Response:**
```json
{
    "success": true,
    "data": {
        "orders": [
            {
                "order_id": 2,
                "serial_no": "ORD-002",
                "cart_id": 3,
                "product_name": "calculator",
                "quantity": 3,
                "total_amount": 3600,
                "status": "pending"
            }
        ],
        "pagination": {...}
    }
}
```

---

## 🔍 Order Details

### 10. Get Specific Order
**Method:** GET  
**URL:** `http://localhost:5000/api/orders/{orderId}`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected:** Full order details including cart_id

---

## ✏️ Order Updates

### 11. Update Buy Order
**Method:** PUT  
**URL:** `http://localhost:5000/api/orders/buy/{orderId}`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {buyerToken}`

**Body:**
```json
{
    "payment_method": "cash"
}
```
**Expected:** Updated order with new payment method

### 12. Update Sell Order
**Method:** PUT  
**URL:** `http://localhost:5000/api/orders/sell/{orderId}`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {sellerToken}`

**Body:**
```json
{
    "status": "completed"
}
```
**Expected:** Updated sell order status

---

## ❌ Error Testing

### 13. Test Missing cart_id
**Method:** POST  
**URL:** `http://localhost:5000/api/orders/buy`  
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer {buyerToken}`

**Body:**
```json
{
    "payment_method": "upi"
}
```
**Expected:** 400 error - "cart_id is required"

### 14. Test Invalid Order ID
**Method:** GET  
**URL:** `http://localhost:5000/api/orders/99999`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected:** 404 error - "Order not found"

### 15. Test Unauthorized Access
**Method:** GET  
**URL:** `http://localhost:5000/api/orders/{sellOrderId}`  
**Headers:** `Authorization: Bearer {buyerToken}`  
**Expected:** 403 error - "Unauthorized access to order"

---

## 🎯 Key Verification Points

### ✅ Cart-Order Connection
1. **Foreign Key Relationship:** Orders table has `cart_id` column referencing `users(user_id)`
2. **Data Integrity:** Buy orders contain the correct `cart_id` value
3. **Automatic Linking:** Orders are automatically linked to cart when created
4. **Cart Clearing:** Cart is emptied after successful order creation

### ✅ FIFO Seller Allocation
1. **Order Processing:** Oldest sell orders are allocated first
2. **Quantity Management:** Sell order quantities are reduced correctly
3. **Status Updates:** Sell orders marked as "completed" when quantity reaches 0

### ✅ API Endpoints Coverage
1. **POST /orders/sell** - Create sell orders
2. **POST /orders/buy** - Create buy orders from cart using cart_id
3. **GET /orders/buy** - Retrieve buyer's orders with cart_id
4. **GET /orders/sell** - Retrieve seller's orders  
5. **GET /orders/:id** - Get specific order details
6. **PUT /orders/buy/:id** - Update buy orders
7. **PUT /orders/sell/:id** - Update sell orders

---

## 🏆 Success Criteria

The cart-order connection is working correctly when:

1. ✅ Buy orders are created with `cart_id` foreign key
2. ✅ Orders can be traced back to their original cart
3. ✅ Cart is automatically cleared after order creation  
4. ✅ FIFO allocation reduces seller inventory appropriately
5. ✅ All CRUD operations work on orders
6. ✅ Proper error handling for edge cases
7. ✅ Authorization and role-based access control works

This simplified approach directly connects orders to carts using the `cart_id` foreign key, making the relationship clear and straightforward!