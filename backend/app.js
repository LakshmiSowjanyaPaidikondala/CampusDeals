require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./src/middleware/auth');
const { requireAuthForBuy, requireAuthForSell, validateTransactionData } = require('./src/middleware/transaction');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());
app.use(express.json());

// Test database connection
const { db, query, run } = require('./src/config/db');

// Test the connection
(async () => {
  try {
    console.log("✅ SQLite Database Connected...");
    console.log("📁 Database location: ./database/campusdeals.db");
  } catch (err) {
    console.error("❌ SQLite Connection Error:", err);
    process.exit(1);
  }
})();

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Backend server is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Protected routes for cart and orders
/* ============================
   CART CRUD (Protected - User specific with Buy Authentication)
============================ */
app.post("/api/cart", requireAuthForBuy, validateTransactionData(['product_id', 'quantity']), async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.userId; // Get user ID from JWT token
    
    const [result] = await run("INSERT INTO cart (user_id, product_id, quantity) VALUES (?,?,?)", [user_id, product_id, quantity]);
    
    res.json({ 
      success: true,
      message: "✅ Item added to cart!",
      user: {
        userId: user_id,
        name: req.userProfile.user_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "❌ Error adding to cart", 
      error: err.message 
    });
  }
});

app.get("/api/cart", requireAuthForBuy, async (req, res) => {
  try {
    const user_id = req.user.userId; // Get user ID from JWT token
    
    const sql = `SELECT c.cart_id, p.product_name, p.product_price, c.quantity, (p.product_price * c.quantity) AS total
                 FROM cart c 
                 JOIN products p ON c.product_id = p.product_id 
                 WHERE c.user_id=?`;
    const [results] = await query(sql, [user_id]);
    
    res.json({
      success: true,
      message: "✅ Cart retrieved successfully",
      cart: results,
      user: {
        userId: user_id,
        name: req.userProfile.user_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "❌ Error fetching cart", 
      error: err.message 
    });
  }
});

app.put("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.userId;
    
    // Ensure user can only update their own cart items
    const [result] = await run("UPDATE cart SET quantity=? WHERE cart_id=? AND user_id=?", [quantity, id, user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Cart item not found or unauthorized" });
    }
    res.json({ message: "✅ Cart Updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error updating cart", error: err.message });
  }
});

app.delete("/api/cart/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    
    // Ensure user can only delete their own cart items
    const [result] = await run("DELETE FROM cart WHERE cart_id=? AND user_id=?", [id, user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Cart item not found or unauthorized" });
    }
    res.json({ message: "🗑 Item removed from cart!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error removing item from cart", error: err.message });
  }
});

/* ============================
   ORDERS CRUD (Protected - User specific with Buy Authentication)
============================ */
app.post("/api/orders", requireAuthForBuy, validateTransactionData(['total_amount', 'payment_method']), async (req, res) => {
  try {
    const { serial_no, total_amount, payment_method, status = 'pending' } = req.body;
    const user_id = req.user.userId; // Get user ID from JWT token
    
    const [result] = await run(
      "INSERT INTO orders (user_id, serial_no, total_amount, payment_method, status) VALUES (?,?,?,?,?)",
      [user_id, serial_no, total_amount, payment_method, status]
    );
    
    res.json({ 
      success: true,
      message: "✅ Order Created!",
      buyer: {
        userId: user_id,
        name: req.userProfile.user_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "❌ Error creating order", 
      error: err.message 
    });
  }
});

app.get("/api/orders", requireAuthForBuy, async (req, res) => {
  try {
    const user_id = req.user.userId; // Get user ID from JWT token
    
    const [results] = await query("SELECT * FROM orders WHERE user_id=?", [user_id]);
    
    res.json({
      success: true,
      message: "✅ Orders retrieved successfully",
      orders: results,
      buyer: {
        userId: user_id,
        name: req.userProfile.user_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "❌ Error fetching orders", 
      error: err.message 
    });
  }
});

// Admin route to get all orders
app.get("/api/orders/all", authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const sql = `SELECT o.*, u.user_name, u.user_email 
                 FROM orders o 
                 JOIN users u ON o.user_id = u.user_id 
                 ORDER BY o.created_at DESC`;
    const [results] = await query(sql);
    
    res.json({
      success: true,
      message: "✅ All orders retrieved successfully",
      orders: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error fetching all orders", error: err.message });
  }
});

app.put("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.userId;
    
    // Users can only update their own orders, admins can update any order
    let sql, params;
    if (req.user.role === 'admin') {
      sql = "UPDATE orders SET status=? WHERE order_id=?";
      params = [status, id];
    } else {
      sql = "UPDATE orders SET status=? WHERE order_id=? AND user_id=?";
      params = [status, id, user_id];
    }
    
    const [result] = await run(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Order not found or unauthorized" });
    }
    res.json({ message: "✅ Order Status Updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error updating order status", error: err.message });
  }
});

app.delete("/api/orders/:id", authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Orders WHERE order_id=?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "❌ Error deleting order", error: err.message });
    }
    res.json({ message: "🗑 Order Deleted!" });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '❌ Something went wrong!' });
});

/* ============================
   SERVER START
============================ */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});