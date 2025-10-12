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
    
    // Check if item already exists in cart (cart_id = user_id)
    const existingItem = db.prepare('SELECT * FROM cart WHERE cart_id = ? AND product_id = ?').get(userId, productId);
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      await productService.checkAvailability(productId, newQuantity);
      
      const updateCart = db.prepare('UPDATE cart SET quantity = ? WHERE cart_id = ? AND product_id = ?');
      updateCart.run(newQuantity, userId, productId);
      
      return await this.getCartItemById(userId, productId);
    } else {
      // Add new item (cart_id = user_id)
      const insertCart = db.prepare('INSERT INTO cart (cart_id, product_id, quantity) VALUES (?, ?, ?)');
      const result = insertCart.run(userId, productId, quantity);
      
      return await this.getCartItemById(userId, productId);
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
      // Buyers see only their own cart items (cart_id = user_id)
      sql += ' WHERE c.cart_id = ? ORDER BY c.created_at DESC';
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
   * Get single cart item by cart_id and product_id
   */
  async getCartItemById(cartId, productId) {
    const cartItem = db.prepare(`
      SELECT c.*, p.product_name, p.product_variant, p.product_price, 
             p.product_images, p.product_code,
             (c.quantity * p.product_price) as item_total
      FROM cart c 
      JOIN products p ON c.product_id = p.product_id 
      WHERE c.cart_id = ? AND c.product_id = ?
    `).get(cartId, productId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    return cartItem;
  }
  
  /**
   * Update cart item quantity
   */
  async updateCartItem(cartId, productId, userId, quantity, userRole) {
    const cartItem = db.prepare('SELECT * FROM cart WHERE cart_id = ? AND product_id = ?').get(cartId, productId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check permissions (users can only update their own cart items, cart_id = user_id)
    if (userRole !== 'admin' && cartId !== userId) {
      throw new Error('Access denied');
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await this.removeFromCart(cartId, productId, userId, userRole);
    }
    
    // Check product availability
    await productService.checkAvailability(productId, quantity);
    
    const updateCart = db.prepare('UPDATE cart SET quantity = ? WHERE cart_id = ? AND product_id = ?');
    updateCart.run(quantity, cartId, productId);
    
    return await this.getCartItemById(cartId, productId);
    updateCart.run(quantity, cartId);
    
    return await this.getCartItemById(cartId);
  }
  
  /**
   * Remove item from cart
   */
  async removeFromCart(cartId, productId, userId, userRole) {
    const cartItem = db.prepare('SELECT * FROM cart WHERE cart_id = ? AND product_id = ?').get(cartId, productId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check permissions (cart_id = user_id)
    if (userRole !== 'admin' && cartId !== userId) {
      throw new Error('Access denied');
    }
    
    const deleteCart = db.prepare('DELETE FROM cart WHERE cart_id = ? AND product_id = ?');
    deleteCart.run(cartId, productId);
    
    return { message: 'Item removed from cart' };
  }
  
  /**
   * Remove multiple items from cart
   */
  async batchRemoveFromCart(cartItems, userId, userRole) {
    const results = [];
    
    for (const item of cartItems) {
      try {
        const result = await this.removeFromCart(item.cartId, item.productId, userId, userRole);
        results.push({ cartId: item.cartId, productId: item.productId, success: true, ...result });
      } catch (error) {
        results.push({ cartId: item.cartId, productId: item.productId, success: false, error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * Clear entire cart for user
   */
  async clearCart(userId) {
    const deleteCart = db.prepare('DELETE FROM cart WHERE cart_id = ?');
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
    const result = db.prepare('SELECT COUNT(*) as count, SUM(quantity) as totalItems FROM cart WHERE cart_id = ?').get(userId);
    
    return {
      uniqueItems: result.count,
      totalItems: result.totalItems || 0
    };
  }
}

module.exports = new CartService();