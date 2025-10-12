/**
 * Product Service
 * Handles business logic for product management
 */

const { db, query, run } = require('../config/db');

class ProductService {
  /**
   * Get all products with optional pagination
   */
  async getAllProducts(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const products = db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    
    return {
      products,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    };
  }
  
  /**
   * Get product by ID
   */
  async getProductById(productId) {
    const product = db.prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }
  
  /**
   * Create new product
   */
  async createProduct(productData) {
    const { product_name, product_variant, product_code, product_price, product_images, quantity } = productData;
    
    // Check if product code already exists
    if (product_code) {
      const existingProduct = db.prepare('SELECT product_id FROM products WHERE product_code = ?').get(product_code);
      if (existingProduct) {
        throw new Error('Product with this code already exists');
      }
    }
    
    const insertProduct = db.prepare(`
      INSERT INTO products 
      (product_name, product_variant, product_code, product_price, product_images, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertProduct.run(product_name, product_variant, product_code, product_price, product_images, quantity);
    
    return await this.getProductById(result.lastInsertRowid);
  }
  
  /**
   * Update product
   */
  async updateProduct(productId, updateData) {
    // First check if product exists
    await this.getProductById(productId);
    
    const { product_name, product_variant, product_code, product_price, product_images, quantity } = updateData;
    
    // Check if product code conflicts with another product
    if (product_code) {
      const existingProduct = db.prepare('SELECT product_id FROM products WHERE product_code = ? AND product_id != ?').get(product_code, productId);
      if (existingProduct) {
        throw new Error('Product with this code already exists');
      }
    }
    
    const updateProduct = db.prepare(`
      UPDATE products 
      SET product_name = ?, product_variant = ?, product_code = ?, 
          product_price = ?, product_images = ?, quantity = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `);
    
    updateProduct.run(product_name, product_variant, product_code, product_price, product_images, quantity, productId);
    
    return await this.getProductById(productId);
  }
  
  /**
   * Delete product
   */
  async deleteProduct(productId) {
    // Check if product exists
    await this.getProductById(productId);
    
    // Check if product is in any carts or orders
    const inCart = db.prepare('SELECT COUNT(*) as count FROM cart WHERE product_id = ?').get(productId);
    const inOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE product_id = ?').get(productId);
    
    if (inCart.count > 0 || inOrders.count > 0) {
      throw new Error('Cannot delete product. It exists in carts or orders.');
    }
    
    const deleteProduct = db.prepare('DELETE FROM products WHERE product_id = ?');
    deleteProduct.run(productId);
    
    return { message: 'Product deleted successfully' };
  }
  
  /**
   * Filter products by criteria
   */
  async filterProducts(filters) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (filters.product_name) {
      sql += ' AND product_name = ?';
      params.push(filters.product_name);
    }
    
    if (filters.product_variant) {
      sql += ' AND product_variant = ?';
      params.push(filters.product_variant);
    }
    
    if (filters.min_price) {
      sql += ' AND product_price >= ?';
      params.push(filters.min_price);
    }
    
    if (filters.max_price) {
      sql += ' AND product_price <= ?';
      params.push(filters.max_price);
    }
    
    if (filters.search) {
      sql += ' AND (product_name LIKE ? OR product_variant LIKE ? OR product_code LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const products = db.prepare(sql).all(...params);
    
    return products;
  }
  
  /**
   * Check product availability
   */
  async checkAvailability(productId, requestedQuantity) {
    const product = await this.getProductById(productId);
    
    if (product.quantity < requestedQuantity) {
      throw new Error(`Insufficient stock. Available: ${product.quantity}, Requested: ${requestedQuantity}`);
    }
    
    return true;
  }
  
  /**
   * Update product quantity (for cart/order operations)
   */
  async updateQuantity(productId, quantityChange) {
    const product = await this.getProductById(productId);
    const newQuantity = product.quantity + quantityChange;
    
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }
    
    const updateQuantity = db.prepare('UPDATE products SET quantity = ? WHERE product_id = ?');
    updateQuantity.run(newQuantity, productId);
    
    return await this.getProductById(productId);
  }
}

module.exports = new ProductService();