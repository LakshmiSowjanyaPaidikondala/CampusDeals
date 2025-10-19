## 📋 HOW BUY & SELL ORDER APIs WORK AND STORE DATA

### 🏗️ Database Architecture

#### Core Tables:
1. **`users`** - User accounts (buyers/sellers)
2. **`products`** - Available products with codes and pricing  
3. **`cart`** - Shopping cart items (temporary storage)
4. **`orders`** - Main order records (buy/sell)
5. **`order_items`** - Detailed line items per order
6. **`serial_allocations`** - Tracks serial number inventory and allocation

---

## 🛒 BUY ORDER API WORKFLOW

### **Endpoint:** `POST /api/orders/buy`
**Access:** Authenticated buyers only

### **Request Flow:**

#### 1. **Request Validation**
```javascript
// Required: cart_id, payment_method
// Validates user role = 'buyer'
// Checks cart ownership (cart_id must match user_id)
```

#### 2. **Cart Processing**
```sql
-- Gets all items from user's cart with product details
SELECT c.cart_id, c.product_id, c.quantity, 
       p.product_name, p.product_variant, p.product_price, p.product_code
FROM cart c
JOIN products p ON c.product_id = p.product_id
WHERE c.cart_id = ?
```

#### 3. **Serial Number Allocation** ⭐ *NEW FEATURE*
For each cart item:
```javascript
// Find lowest available serial numbers in ascending order
const availableSerials = db.prepare(`
    SELECT serial_number 
    FROM serial_allocations 
    WHERE product_code = ? AND buy_order_id IS NULL
    ORDER BY serial_number ASC
    LIMIT ?
`).all(productCode, quantity);

// Mark serials as allocated to this buyer
UPDATE serial_allocations 
SET buy_order_id = ?, allocated_at = CURRENT_TIMESTAMP
WHERE serial_number = ?
```

#### 4. **Order Creation**
```sql
-- Creates main order record
INSERT INTO orders (
    user_id, serial_no, order_type, product_id, quantity, 
    cart_id, total_amount, payment_method, status
) VALUES (?, ?, 'buy', ?, ?, ?, ?, ?, 'pending')
```

#### 5. **Order Items Storage**
```sql
-- Stores detailed line items with allocated serial numbers
INSERT INTO order_items (
    order_id, product_id, quantity, price_per_item, 
    item_total, serial_numbers
) VALUES (?, ?, ?, ?, ?, ?)
```

#### 6. **FIFO Matching** (Legacy Logic)
```sql
-- Updates corresponding sell orders using FIFO
SELECT order_id, quantity FROM orders 
WHERE product_id = ? AND order_type = 'sell' 
  AND status = 'pending' AND quantity > 0
ORDER BY created_at ASC
```

#### 7. **Cart Cleanup**
```sql
DELETE FROM cart WHERE cart_id = ?
```

### **Data Storage for Buy Orders:**

| Table | Data Stored |
|-------|-------------|
| `orders` | Main order: user_id, serial_no (ORD-001), total_amount, status |
| `order_items` | Line items: product_id, quantity, allocated serial_numbers (JSON) |
| `serial_allocations` | Allocation tracking: buy_order_id updated from NULL |

**Serial Numbers JSON Format:**
```json
["DFT-P001", "DFT-P002", "WLC-S001"]
```

---

## 🏪 SELL ORDER API WORKFLOW  

### **Endpoint:** `POST /api/orders/sell`
**Access:** Authenticated sellers only

### **Request Flow:**

#### 1. **Request Validation**
```javascript
// Required: cart_id, payment_method (defaults to 'cash')
// Validates user role = 'seller'  
// Checks cart ownership (cart_id must match user_id)
```

#### 2. **Cart Processing**
```sql  
-- Gets seller's cart items with product codes
SELECT c.cart_id, c.product_id, c.quantity,
       p.product_name, p.product_variant, p.product_price, p.product_code
FROM cart c
JOIN products p ON c.product_id = p.product_id
WHERE c.cart_id = ?
```

#### 3. **Serial Number Generation**
For each cart item:
```javascript
// Generates unique serial numbers based on product code and quantity
// Format: <product_code><3-digit-sequence>
const generateItemSerialNumbers = (productCode, quantity) => {
    const serialNumbers = [];
    for (let i = 1; i <= quantity; i++) {
        const serialNumber = `${productCode}${i.toString().padStart(3, '0')}`;
        serialNumbers.push(serialNumber);
    }
    return serialNumbers;
};

// Example: DFT-P → ["DFT-P001", "DFT-P002", "DFT-P003"]
```

#### 4. **Order Creation**
```sql
-- Creates main sell order
INSERT INTO orders (
    user_id, serial_no, order_type, product_id, quantity,
    cart_id, total_amount, payment_method, status  
) VALUES (?, ?, 'sell', ?, ?, ?, ?, ?, 'pending')
```

#### 5. **Order Items & Serial Inventory Creation**
```sql
-- Stores order line items
INSERT INTO order_items (
    order_id, product_id, quantity, price_per_item,
    item_total, serial_numbers
) VALUES (?, ?, ?, ?, ?, ?)

-- Creates available serial inventory
INSERT INTO serial_allocations (
    product_code, serial_number, sell_order_id
) VALUES (?, ?, ?)
```

### **Data Storage for Sell Orders:**

| Table | Data Stored |
|-------|-------------|
| `orders` | Main order: user_id, serial_no (ORD-001), total_amount, status |
| `order_items` | Line items: product_id, quantity, generated serial_numbers (JSON) |
| `serial_allocations` | Inventory: serial_number, sell_order_id, buy_order_id=NULL (available) |

---

## 📊 DATA FLOW EXAMPLE

### Scenario: Seller lists 3 DFT-P drafters, Buyer purchases 2

#### **Step 1: Sell Order Creation**
```javascript
POST /api/orders/sell
Body: { cart_id: 5, payment_method: "cash" }

// Database Updates:
orders: { order_id: 1, user_id: 5, order_type: "sell", quantity: 3, total_amount: 150 }
order_items: { order_id: 1, product_id: 1, serial_numbers: '["DFT-P001","DFT-P002","DFT-P003"]' }
serial_allocations: 
  { serial_number: "DFT-P001", sell_order_id: 1, buy_order_id: NULL }
  { serial_number: "DFT-P002", sell_order_id: 1, buy_order_id: NULL }  
  { serial_number: "DFT-P003", sell_order_id: 1, buy_order_id: NULL }
```

#### **Step 2: Buy Order Creation**
```javascript
POST /api/orders/buy  
Body: { cart_id: 3, payment_method: "upi" }

// Database Updates:
orders: { order_id: 2, user_id: 3, order_type: "buy", quantity: 2, total_amount: 100 }
order_items: { order_id: 2, product_id: 1, serial_numbers: '["DFT-P001","DFT-P002"]' }
serial_allocations: 
  { serial_number: "DFT-P001", sell_order_id: 1, buy_order_id: 2 } ← ALLOCATED
  { serial_number: "DFT-P002", sell_order_id: 1, buy_order_id: 2 } ← ALLOCATED
  { serial_number: "DFT-P003", sell_order_id: 1, buy_order_id: NULL } ← AVAILABLE
```

---

## 📤 API RESPONSE FORMATS

### **Buy Order Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "order_id": 2,
      "serial_no": "ORD-002", 
      "total_amount": 100,
      "status": "pending",
      "items": [
        {
          "product_name": "drafter",
          "quantity": 2,
          "serial_numbers": ["DFT-P001", "DFT-P002"]
        }
      ]
    }
  }
}
```

### **Sell Order Response:**  
```json
{
  "success": true,
  "data": {
    "order": {
      "order_id": 1,
      "serial_no": "ORD-001",
      "total_amount": 150,
      "status": "pending", 
      "items": [
        {
          "product_name": "drafter",
          "quantity": 3,
          "serial_numbers": ["DFT-P001", "DFT-P002", "DFT-P003"]
        }
      ]
    }
  }
}
```

---

## 🔍 GET ORDERS APIs

### **GET /api/orders/buy** - View Buy Orders
```sql
-- Gets buyer's orders with allocated serial numbers
SELECT o.order_id, o.serial_no, o.total_amount, o.status,
       oi.product_id, oi.quantity, oi.serial_numbers,
       p.product_name, p.product_variant
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id  
JOIN products p ON oi.product_id = p.product_id
WHERE o.user_id = ? AND o.order_type = 'buy'
```

### **GET /api/orders/sell** - View Sell Orders
```sql  
-- Gets seller's orders with generated serial numbers
SELECT o.order_id, o.serial_no, o.total_amount, o.status,
       oi.product_id, oi.quantity, oi.serial_numbers,
       p.product_name, p.product_variant  
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.user_id = ? AND o.order_type = 'sell'
```

---

## 🎯 KEY FEATURES

### **Serial Number Management:**
✅ **Sell Orders:** Generate unique serials (DFT-P001, DFT-P002...)  
✅ **Buy Orders:** Allocate lowest available serials in ascending order  
✅ **Traceability:** Track which sell order created each serial and which buy order received it  
✅ **Inventory Control:** Real-time tracking of available vs. allocated serials  

### **Data Integrity:**
✅ **Transactions:** All operations wrapped in database transactions  
✅ **Foreign Keys:** Referential integrity between all tables  
✅ **Constraints:** Role validation, payment method validation, status checks  
✅ **JSON Storage:** Serial numbers stored as JSON arrays for efficient retrieval  

### **Business Logic:**
✅ **FIFO Matching:** Buy orders matched with earliest sell orders  
✅ **Cart Integration:** Orders created from shopping cart contents  
✅ **Role-Based Access:** Buyers can only buy, sellers can only sell  
✅ **Stock Validation:** Prevents overselling with insufficient inventory  

This architecture provides complete traceability, automatic serial allocation, and robust inventory management for the campus marketplace.