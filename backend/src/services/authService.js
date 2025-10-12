/**
 * Authentication Service
 * Handles business logic for user authentication and authorization
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, query, run } = require('../config/db');

class AuthService {
  /**
   * Create a new user account
   */
  async createUser(userData) {
    const { user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency } = userData;
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT user_id FROM users WHERE user_email = ?').get(user_email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 12);
    
    // Insert user
    const insertUser = db.prepare(`
      INSERT INTO users 
      (user_name, user_email, user_password, role, user_phone, user_studyyear, user_branch, user_section, user_residency, payment_received, amount_given)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
    
    const result = insertUser.run(user_name, user_email, hashedPassword, role || 'buyer', user_phone, user_studyyear, user_branch, user_section, user_residency);
    
    return {
      userId: result.lastInsertRowid,
      user_name,
      user_email,
      role: role || 'buyer'
    };
  }
  
  /**
   * Authenticate user login
   */
  async authenticateUser(user_email, user_password) {
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE user_email = ?').get(user_email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(user_password, user.user_password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    return {
      userId: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role: user.role
    };
  }
  
  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.userId,
      user_email: user.user_email,
      role: user.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'campusdeals_secret_key_2024', {
      expiresIn: '24h'
    });
  }
  
  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'campusdeals_secret_key_2024');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const user = db.prepare(`
      SELECT user_id, user_name, user_email, role, user_phone, user_studyyear, 
             user_branch, user_section, user_residency, payment_received, amount_given,
             created_at, updated_at
      FROM users WHERE user_id = ?
    `).get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  /**
   * Validate user for transaction
   */
  async validateUserForTransaction(userId, requiredRole) {
    const user = await this.getUserProfile(userId);
    
    if (requiredRole && user.role !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }
    
    return user;
  }
}

module.exports = new AuthService();