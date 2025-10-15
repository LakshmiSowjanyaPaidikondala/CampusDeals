# Cart API Documentation

## 📝 Overview
Complete API endpoints for cart management including add, update, delete, and batch operations.

## 🛒 Cart Endpoints

### 1. Add Item to Cart
**`POST /api/cart/add`**

**Description:** Add a product to the user's cart or update quantity if already exists.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "drafter (premium_drafter) added successfully",
  "data": {
    "item_id": 1,
    "product_name": "drafter",
    "product_variant": "premium_drafter",
    "quantity_added": 2,
    "price_per_item": 400.00,
    "item_total": 800.00
  }
}
```

---

### 2. Get Cart Items
**`GET /api/cart`**

**Description:** Retrieve all items in the user's cart with total cost.

**Authentication:** Required (Bearer Token)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cart items retrieved successfully",
  "data": {
    "items": [
      {
        "cart_id": 12,
        "product_id": 1,
        "product_name": "drafter",
        "product_variant": "premium_drafter",
        "product_code": "DFT-P",
        "product_images": "Drafter.jpeg",
        "quantity": 2,
        "price_per_item": 400.00,
        "item_total": 800.00,
        "added_at": "2025-10-14T10:30:00.000Z"
      }
    ],
    "total_items": 2,
    "total_cost": 800.00
  }
}
```

---

### 3. Update Cart Item
**`PUT /api/cart/update`**

**Description:** Update the quantity of a specific item in the cart.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 3
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "product_id": 1,
    "product_name": "drafter",
    "product_variant": "premium_drafter",
    "quantity": 3,
    "price_per_item": 400.00,
    "item_total": 1200.00
  }
}
```

---

### 4. Batch Update Cart Items
**`PUT /api/cart/batch-update`**

**Description:** Update multiple cart items in a single request.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "items": [
    {"product_id": 1, "quantity": 3},
    {"product_id": 2, "quantity": 1},
    {"product_id": 3, "quantity": 2}
  ]
}
```

**Response (Success - 200/207):**
```json
{
  "success": true,
  "message": "Batch update completed. 3 items updated, 0 errors.",
  "data": {
    "updated": [
      {
        "product_id": 1,
        "product_name": "drafter",
        "quantity": 3,
        "success": true
      }
    ],
    "errors": [],
    "summary": {
      "totalItems": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

---

### 5. Remove Single Item from Cart
**`DELETE /api/cart/remove/:productId`**

**Description:** Remove a specific product from the cart.

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `productId` (number): ID of the product to remove

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "drafter (premium_drafter) removed from cart successfully"
}
```

---

### 6. Batch Remove Cart Items
**`DELETE /api/cart/batch-remove`**

**Description:** Remove multiple items from cart in a single request.

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "product_ids": [1, 2, 3]
}
```

**Response (Success - 200/207):**
```json
{
  "success": true,
  "message": "Batch removal completed. 3 items removed, 0 errors.",
  "data": {
    "removed": [
      {
        "product_id": 1,
        "product_name": "drafter",
        "product_variant": "premium_drafter",
        "success": true
      }
    ],
    "errors": [],
    "summary": {
      "totalItems": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

---

### 7. Clear Entire Cart
**`DELETE /api/cart/clear`**

**Description:** Remove all items from the user's cart.

**Authentication:** Required (Bearer Token)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully. 3 items removed.",
  "data": {
    "itemsRemoved": 3,
    "clearedAt": "2025-10-14T10:30:00.000Z"
  }
}
```

---

## 🔧 Error Responses

### Common Errors

**401 Unauthorized:**
```json
{
  "message": "❌ Access token required"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Product ID and quantity are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Cart item not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Stock Validation Error:
```json
{
  "success": false,
  "message": "Insufficient stock. Only 5 items available"
}
```

---

## 📋 Usage Examples

### JavaScript (Fetch API)

#### Add to Cart
```javascript
const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Add to cart error:', error);
  }
};
```

#### Update Cart Item
```javascript
const updateCartItem = async (productId, newQuantity) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/cart/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: newQuantity
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update cart error:', error);
  }
};
```

#### Batch Update
```javascript
const batchUpdateCart = async (items) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('/api/cart/batch-update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Batch update error:', error);
  }
};
```

#### Remove from Cart
```javascript
const removeFromCart = async (productId) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`/api/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Remove from cart error:', error);
  }
};
```

### cURL Examples

#### Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

#### Update Cart
```bash
curl -X PUT http://localhost:3000/api/cart/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 3}'
```

#### Remove from Cart
```bash
curl -X DELETE http://localhost:3000/api/cart/remove/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Clear Cart
```bash
curl -X DELETE http://localhost:3000/api/cart/clear \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Key Features

### ✅ **Standard Operations**
- Add items to cart
- Get cart contents
- Update item quantities
- Remove individual items
- Clear entire cart

### ✅ **Batch Operations**
- Update multiple items at once
- Remove multiple items at once
- Detailed success/error reporting

### ✅ **Security Features**
- JWT authentication required
- User isolation (users can only access their own cart)
- Input validation and sanitization

### ✅ **Business Logic**
- Stock availability checking
- Automatic quantity updates
- Total cost calculations
- Comprehensive error handling

### ✅ **Data Integrity**
- Composite primary key (cart_id, product_id)
- Foreign key constraints
- Transaction safety

---

## 🔄 Related Endpoints

- `POST /api/auth/login` - User login
- `GET /api/products` - Get available products
- `POST /api/orders` - Create order from cart items

---

## 📊 HTTP Status Codes

- **200** - Success
- **207** - Multi-Status (partial success in batch operations)
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **404** - Not Found (cart item not found)
- **500** - Internal Server Error