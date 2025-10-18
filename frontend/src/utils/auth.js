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

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const removeRefreshToken = () => {
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

// Logout
export const logout = () => {
  removeToken();
  removeUser();
  clearCart();
  removeRefreshToken();
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
