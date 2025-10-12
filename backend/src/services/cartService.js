/**
 * Cart Service
 * Handles business logic for shopping cart operations
 */

const { db, query, run } = require('../config/db');
const productService = require('./productService');

class CartService {
  /**
   * Add item to cart
   */
  async addToCart(userId, productId, quantity) {
    // Check product availability
    await productService.checkAvailability(productId, quantity);
    
    // Check if item already exists in cart
    const existingItem = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(userId, productId);
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      await productService.checkAvailability(productId, newQuantity);
      
      const updateCart = db.prepare('UPDATE cart SET quantity = ? WHERE cart_id = ?');
      updateCart.run(newQuantity, existingItem.cart_id);
      
      return await this.getCartItemById(existingItem.cart_id);
    } else {
      // Add new item
      const insertCart = db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)');
      const result = insertCart.run(userId, productId, quantity);
      
      return await this.getCartItemById(result.lastInsertRowid);
    }
  }
  
  /**
   * Get cart items for user
   */
  async getCartItems(userId, userRole) {
    let sql = `
      SELECT c.*, p.product_name, p.product_variant, p.product_price, 
             p.product_images, p.product_code, p.quantity as available_quantity,
             (c.quantity * p.product_price) as item_total
      FROM cart c 
      JOIN products p ON c.product_id = p.product_id 
    `;
    
    const params = [];
    
    if (userRole === 'seller') {
      // Sellers can see all cart items
      sql += ' ORDER BY c.created_at DESC';
    } else {
      // Buyers see only their own cart items
      sql += ' WHERE c.user_id = ? ORDER BY c.created_at DESC';
      params.push(userId);
    }
    
    const cartItems = db.prepare(sql).all(...params);
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + item.item_total, 0);
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    return {
      cartItems,
      summary: {
        totalItems,
        subtotal,
        total: subtotal // Add tax/shipping logic here if needed
      }
    };
  }
  
  /**
   * Get single cart item by ID
   */
  async getCartItemById(cartId) {
    const cartItem = db.prepare(`
      SELECT c.*, p.product_name, p.product_variant, p.product_price, 
             p.product_images, p.product_code,
             (c.quantity * p.product_price) as item_total
      FROM cart c 
      JOIN products p ON c.product_id = p.product_id 
      WHERE c.cart_id = ?
    `).get(cartId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    return cartItem;
  }
  
  /**
   * Update cart item quantity
   */
  async updateCartItem(cartId, userId, quantity, userRole) {
    const cartItem = db.prepare('SELECT * FROM cart WHERE cart_id = ?').get(cartId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check permissions (users can only update their own cart items)
    if (userRole !== 'admin' && cartItem.user_id !== userId) {
      throw new Error('Access denied');
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await this.removeFromCart(cartId, userId, userRole);
    }
    
    // Check product availability
    await productService.checkAvailability(cartItem.product_id, quantity);
    
    const updateCart = db.prepare('UPDATE cart SET quantity = ? WHERE cart_id = ?');
    updateCart.run(quantity, cartId);
    
    return await this.getCartItemById(cartId);
  }
  
  /**
   * Remove item from cart
   */
  async removeFromCart(cartId, userId, userRole) {
    const cartItem = db.prepare('SELECT * FROM cart WHERE cart_id = ?').get(cartId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check permissions
    if (userRole !== 'admin' && cartItem.user_id !== userId) {
      throw new Error('Access denied');
    }
    
    const deleteCart = db.prepare('DELETE FROM cart WHERE cart_id = ?');
    deleteCart.run(cartId);
    
    return { message: 'Item removed from cart' };
  }
  
  /**
   * Remove multiple items from cart
   */
  async batchRemoveFromCart(cartIds, userId, userRole) {
    const results = [];
    
    for (const cartId of cartIds) {
      try {
        const result = await this.removeFromCart(cartId, userId, userRole);
        results.push({ cartId, success: true, ...result });
      } catch (error) {
        results.push({ cartId, success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * Clear entire cart for user
   */
  async clearCart(userId) {
    const deleteCart = db.prepare('DELETE FROM cart WHERE user_id = ?');
    const result = deleteCart.run(userId);
    
    return { 
      message: 'Cart cleared successfully',
      deletedItems: result.changes
    };
  }
  
  /**
   * Get cart item count for user
   */
  async getCartItemCount(userId) {
    const result = db.prepare('SELECT COUNT(*) as count, SUM(quantity) as totalItems FROM cart WHERE user_id = ?').get(userId);
    
    return {
      uniqueItems: result.count,
      totalItems: result.totalItems || 0
    };
  }
}

module.exports = new CartService();