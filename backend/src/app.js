/**
 * CampusDeals Express Application Configuration
 * Configures Express app with middleware, routes, and error handling
 */

const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const buyCartRoutes = require('./routes/buyCartRoutes');
const sellCartRoutes = require('./routes/sellCartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const { requireAuthForBuy, requireAuthForSell, validateTransactionData } = require('./middleware/transaction');

// Import database helpers
const { db, query, run } = require('./config/db');

// Create Express application
const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
(() => {
  try {
    console.log("✅ SQLite Database Connected...");
    console.log("📁 Database location: ./database/campusdeals.db");
  } catch (err) {
    console.error("❌ SQLite Connection Error:", err);
    throw err;
  }
})();

// Health check routes
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Backend server is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Test auth endpoint
app.post('/api/test-auth', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Auth endpoint is reachable!', 
    receivedData: req.body,
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cart/buy', buyCartRoutes);
app.use('/api/cart/sell', sellCartRoutes);
app.use('/api/orders', ordersRoutes);

// Legacy cart routes (for backward compatibility)
app.post("/api/cart", requireAuthForBuy, validateTransactionData(['product_id', 'quantity']), (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.userId;
    
    const [result] = run("INSERT INTO cart (cart_id, product_id, quantity) VALUES (?,?,?)", [user_id, product_id, quantity]);
    
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

app.get("/api/cart", requireAuthForBuy, (req, res) => {
  try {
    const user_id = req.user.userId;
    const sql = `SELECT c.*, p.product_name, p.product_variant, p.product_price, p.product_images 
                 FROM cart c 
                 JOIN products p ON c.product_id = p.product_id 
                 WHERE c.user_id = ?`;
    const [results] = query(sql, [user_id]);
    
    res.json({
      success: true,
      message: "✅ Cart items retrieved successfully",
      cartItems: results,
      user: {
        userId: user_id,
        name: req.userProfile.user_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "❌ Error fetching cart items", 
      error: err.message 
    });
  }
});

// Legacy order routes (for backward compatibility)
app.get("/api/orders", requireAuthForBuy, (req, res) => {
  try {
    const user_id = req.user.userId;
    const sql = `SELECT o.*, p.product_name, p.product_variant, p.product_images 
                 FROM orders o 
                 JOIN products p ON o.product_id = p.product_id 
                 WHERE o.user_id = ? 
                 ORDER BY o.created_at DESC`;
    const [results] = query(sql, [user_id]);
    
    res.json({
      success: true,
      message: "✅ Orders retrieved successfully", 
      orders: results,
      user: {
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
app.get("/api/orders/all", authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const sql = `SELECT o.*, u.user_name, u.user_email 
                 FROM orders o 
                 JOIN users u ON o.user_id = u.user_id 
                 ORDER BY o.created_at DESC`;
    const [results] = query(sql);
    
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

// Order management routes
app.put("/api/orders/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Users can only update their own orders, admins can update any order
    let sql = "UPDATE orders SET status=? WHERE order_id=?";
    let params = [status, id];
    
    if (userRole !== 'admin') {
      sql += " AND user_id=?";
      params.push(userId);
    }
    
    const [result] = run(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Order not found or access denied" });
    }
    
    res.json({ message: "📝 Order Updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error updating order", error: err.message });
  }
});

app.delete("/api/orders/:id", authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const { id } = req.params;
    const [result] = run("DELETE FROM orders WHERE order_id=?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Order not found" });
    }
    res.json({ message: "🗑 Order Deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error deleting order", error: err.message });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '❌ API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || '❌ Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

module.exports = app;