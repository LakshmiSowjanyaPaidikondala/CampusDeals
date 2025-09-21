# Product API Testing Guide 🧪

Your backend server should be running on: **http://localhost:5000**

## 📋 Available Product Endpoints

All product endpoints are **PUBLIC** (no authentication required):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get specific product by ID |
| GET | `/api/products/filter` | Filter products by category/condition |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update existing product |
| DELETE | `/api/products/:id` | Delete product |

---

## 🔍 Testing Methods

### Method 1: Browser (For GET requests only)
Simply open these URLs in your browser:
- http://localhost:5000/api/products
- http://localhost:5000/api/products/1
- http://localhost:5000/api/products/filter?product_name=calculator

### Method 2: PowerShell (using Invoke-RestMethod)
```powershell
# Test GET all products
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET

# Test GET specific product
Invoke-RestMethod -Uri "http://localhost:5000/api/products/1" -Method GET
```

### Method 3: Command Line (using curl)
```bash
# GET all products
curl http://localhost:5000/api/products

# GET specific product
curl http://localhost:5000/api/products/1
```

### Method 4: Postman/Thunder Client/REST Client

---

## 📝 Detailed Test Cases

### 1. GET All Products
**URL:** `GET http://localhost:5000/api/products`

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Products retrieved successfully",
  "count": 0,
  "products": []
}
```

### 2. GET Product by ID
**URL:** `GET http://localhost:5000/api/products/1`

**Expected Response (if product exists):**
```json
{
  "success": true,
  "message": "✅ Product retrieved successfully",
  "product": {
    "product_id": 1,
    "product_name": "calculator",
    "product_variant": "MS",
    "product_code": "CALC001",
    "product_price": 25.99,
    "product_images": "calc.jpg",
    "quantity": 10,
    "created_at": "2025-09-13T...",
    "updated_at": "2025-09-13T..."
  }
}
```

**Expected Response (if product not found):**
```json
{
  "success": false,
  "message": "❌ Product not found",
  "productId": "1"
}
```

### 3. CREATE New Product
**URL:** `POST http://localhost:5000/api/products`

**Valid Product Names:** `drafter`, `white_lab_coat`, `brown_lab_coat`, `calculator`

**Request Body Example:**
```json
{
  "product_name": "calculator",
  "product_variant": "MS",
  "product_code": "CALC001",
  "product_price": 25.99,
  "product_images": "calculator.jpg",
  "quantity": 10
}
```

**Valid Variants by Product:**
- `drafter`: `premium_drafter`, `standard_drafter`, `budget_drafter`
- `white_lab_coat`: `S`, `M`, `L`, `XL`, `XXL`
- `brown_lab_coat`: `S`, `M`, `L`, `XL`, `XXL`
- `calculator`: `MS`, `ES`, `ES-Plus`

### 4. UPDATE Product
**URL:** `PUT http://localhost:5000/api/products/1`

**Request Body (partial update allowed):**
```json
{
  "product_price": 29.99,
  "quantity": 15
}
```

### 5. DELETE Product
**URL:** `DELETE http://localhost:5000/api/products/1`

**Expected Response:**
```json
{
  "success": true,
  "message": "🗑️ Product deleted successfully",
  "deletedProduct": {
    "productId": "1",
    "product_name": "calculator",
    "product_variant": "MS"
  }
}
```

### 6. Filter Products
**URL:** `GET http://localhost:5000/api/products/filter`

**Query Parameters:**
- `product_name` - Filter by product name
- `product_variant` - Filter by variant
- `min_price` - Minimum price
- `max_price` - Maximum price  
- `in_stock=true` - Only products with quantity > 0

**Example:** `http://localhost:5000/api/products/filter?product_name=calculator&in_stock=true`

---

## 🧪 PowerShell Test Commands

### Quick Test - GET All Products
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
```

### Create a New Product
```powershell
$body = @{
    product_name = "calculator"
    product_variant = "MS"
    product_code = "CALC001"
    product_price = 25.99
    product_images = "calculator.jpg"
    quantity = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method POST -Body $body -ContentType "application/json"
```

### Update a Product
```powershell
$updateBody = @{
    product_price = 29.99
    quantity = 15
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/products/1" -Method PUT -Body $updateBody -ContentType "application/json"
```

### Delete a Product
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products/1" -Method DELETE
```

---

## ❌ Common Error Responses

### Invalid Product Name
```json
{
  "success": false,
  "message": "❌ Invalid product name",
  "field": "product_name",
  "validOptions": ["drafter", "white_lab_coat", "brown_lab_coat", "calculator"]
}
```

### Missing Required Fields
```json
{
  "success": false,
  "message": "❌ Missing required fields",
  "details": "Missing fields: product_name, product_price",
  "missingFields": ["product_name", "product_price"],
  "requiredFields": ["product_name", "product_variant", "product_price", "quantity"]
}
```

### Product Code Already Exists
```json
{
  "success": false,
  "message": "❌ Product code already exists",
  "field": "product_code",
  "suggestion": "Use a different product code"
}
```

---

## 🎯 Testing Checklist

- [ ] ✅ GET all products (empty database)
- [ ] ✅ Create first product
- [ ] ✅ GET all products (with data)
- [ ] ✅ GET specific product by ID
- [ ] ✅ GET non-existent product (404 test)
- [ ] ✅ Create product with invalid name
- [ ] ✅ Create product with invalid variant
- [ ] ✅ Create product with duplicate code
- [ ] ✅ Update product price
- [ ] ✅ Filter products by name
- [ ] ✅ Filter products by price range
- [ ] ✅ Delete product
- [ ] ✅ Try to delete non-existent product

**Happy Testing! 🚀**