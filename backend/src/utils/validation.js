const { db, query } = require('../config/db');

// Validation utility functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 6 characters long
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'Password must contain at least one letter and one number' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

const validateRequiredFields = (fields, requiredFields) => {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!fields[field] || fields[field].toString().trim() === '') {
      missing.push(field);
    }
  });
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    message: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : 'All required fields present'
  };
};

// Database utility functions
const checkUserExists = (email) => {
  try {
    const [users] = query(
      'SELECT user_id, user_email FROM users WHERE user_email = ?',
      [email]
    );
    return {
      exists: users.length > 0,
      user: users.length > 0 ? users[0] : null
    };
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw new Error('Database error while checking user');
  }
};

const getUserByEmail = (email) => {
  try {
    const [users] = query(
      'SELECT user_id, user_name, user_email, user_password, role FROM users WHERE user_email = ?',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Database error while fetching user');
  }
};

const getUserById = (userId) => {
  try {
    const [users] = query(
      `SELECT user_id, user_name, user_email, role, user_phone, user_studyyear, 
       user_branch, user_section, user_residency, payment_received, amount_given 
       FROM users WHERE user_id = ?`,
      [userId]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Database error while fetching user');
  }
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
};

const sanitizeUserInput = (userData) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(userData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  checkUserExists,
  getUserByEmail,
  getUserById,
  sanitizeInput,
  sanitizeUserInput
};
