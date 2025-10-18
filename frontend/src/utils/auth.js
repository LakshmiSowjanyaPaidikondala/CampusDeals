// src/utils/auth.js

const API_BASE_URL = 'http://localhost:5000/api';

// Token management
export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const removeToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
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
      // Handle new token structure from backend
      if (data.accessToken) {
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
      } else if (data.token) {
        setToken(data.token); // Backward compatibility
      }
      setUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Register API call
export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Registration response:', data);
    
    if (data.success) {
      // Handle new token structure from backend
      if (data.accessToken) {
        setToken(data.accessToken);
        setRefreshToken(data.refreshToken);
      } else if (data.token) {
        setToken(data.token); // Backward compatibility
      }
      setUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, message: data.message || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Logout API call
export const logout = async () => {
  try {
    const token = getToken();
    const refreshToken = getRefreshToken();
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage regardless of API call success
    removeToken();
    removeUser();
    clearCart();
  }
};

// Refresh token API call
export const refreshTokens = async () => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (data.success) {
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return { success: true, data };
    } else {
      // Refresh token is invalid, force logout
      await logout();
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    await logout();
    return { success: false, message: 'Session expired. Please login again.' };
  }
};

// API call with automatic token refresh
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  // If token is expired, try to refresh
  if (response.status === 401) {
    const refreshResult = await refreshTokens();
    
    if (refreshResult.success) {
      const newToken = getToken();
      // Retry the original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('Session expired. Please login again.');
    }
  }
  
  return response;
};

// Legacy function for backward compatibility
export const getCurrentUser = () => {
  return getUser() || {
    email: "323103310171@gvpce.ac.in", // project owner email (fallback)
    role: "admin"
  };
};
