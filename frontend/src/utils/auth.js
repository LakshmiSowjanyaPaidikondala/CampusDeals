// src/utils/auth.js

import {
  getAuthTokenCookie,
  setAuthTokenCookie,
  removeAuthTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
  removeRefreshTokenCookie,
  getUserDataCookie,
  setUserDataCookie,
  removeUserDataCookie,
  getCartCookie,
  setCartCookie,
  removeCartCookie,
  clearAuthCookies
} from './cookies.js';

const API_BASE_URL = 'http://localhost:5000/api';

// Token management - using cookies instead of localStorage
export const getToken = () => {
  return getAuthTokenCookie();
};

export const setToken = (token) => {
  setAuthTokenCookie(token);
};

export const removeToken = () => {
  removeAuthTokenCookie();
};

export const getRefreshToken = () => {
  return getRefreshTokenCookie();
};

export const setRefreshToken = (token) => {
  setRefreshTokenCookie(token);
};

export const removeRefreshToken = () => {
  removeRefreshTokenCookie();
};

// User data management - using cookies instead of localStorage
export const getUser = () => {
  return getUserDataCookie();
};

export const setUser = (userData) => {
  setUserDataCookie(userData);
};

export const removeUser = () => {
  removeUserDataCookie();
};

// Cart management - using cookies instead of localStorage
export const saveCart = (cart) => {
  setCartCookie('cart', cart);
};

export const getCart = () => {
  return getCartCookie('cart');
};

export const clearCart = () => {
  removeCartCookie('cart');
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
      // Store access token and refresh token
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
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
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store access token and refresh token for automatic login after registration
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Refresh token API call
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
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
      // Update tokens
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      return { success: true, data };
    } else {
      // Refresh token is invalid, logout user
      logout();
      return { success: false, message: data.message };
    }
  } catch (error) {
    logout();
    return { success: false, message: 'Token refresh failed' };
  }
};

// Logout - clear all authentication cookies
export const logout = () => {
  clearAuthCookies();
};

// Fetch user profile from backend
export const fetchUserProfile = async () => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'No authentication token' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success) {
      // Update stored user data with fresh data from backend
      setUser(data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Failed to fetch user profile' };
  }
};

// Update user profile
export const updateUserProfile = async (userId, updatedData) => {
  try {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'No authentication token' };
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Fetch updated user profile after successful update
      const profileResult = await fetchUserProfile();
      if (profileResult.success) {
        return { success: true, message: data.message, user: profileResult.user };
      }
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || 'Failed to update profile' };
    }
  } catch (error) {
    return { success: false, message: 'Network error. Please try again.' };
  }
};

// Legacy function for backward compatibility
export const getCurrentUser = () => {
  return getUser() || {
    email: "323103310171@gvpce.ac.in", // project owner email (fallback)
    role: "admin"
  };
};
