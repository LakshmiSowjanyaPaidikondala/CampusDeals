// src/utils/auth.js

const API_BASE_URL = 'http://localhost:5000/api';

// Token management
export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// User data management
export const getUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const removeUser = () => {
  localStorage.removeItem('userData');
};

// Cart management
export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const getCart = () => {
  const cartData = localStorage.getItem('cart');
  return cartData ? JSON.parse(cartData) : [];
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};

// Authentication check
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

// Login API call
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user_email: email, 
        user_password: password 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Register API call
export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        user_name: name,
        user_email: email, 
        user_password: password 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout
export const logout = () => {
  removeToken();
  removeUser();
  clearCart();
};

// Legacy function for backward compatibility
export const getCurrentUser = () => {
  return getUser() || {
    email: "323103310171@gvpce.ac.in", // project owner email (fallback)
    role: "admin"
  };
};
