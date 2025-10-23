// Cookie utility functions for secure token storage
// Provides functions to set, get, and remove cookies with security options

/**
 * Set a cookie with security options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 */
export const setCookie = (name, value, options = {}) => {
  const defaultOptions = {
    path: '/',
    secure: window.location.protocol === 'https:', // Only secure in production HTTPS
    sameSite: 'strict', // CSRF protection
    httpOnly: false, // Can't be httpOnly for client-side access
    ...options
  };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Add path
  if (defaultOptions.path) {
    cookieString += `; path=${defaultOptions.path}`;
  }

  // Add domain
  if (defaultOptions.domain) {
    cookieString += `; domain=${defaultOptions.domain}`;
  }

  // Add expiration
  if (defaultOptions.expires) {
    if (defaultOptions.expires instanceof Date) {
      cookieString += `; expires=${defaultOptions.expires.toUTCString()}`;
    } else if (typeof defaultOptions.expires === 'number') {
      // Expires in days
      const date = new Date();
      date.setTime(date.getTime() + (defaultOptions.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
  }

  // Add max-age (in seconds)
  if (defaultOptions.maxAge) {
    cookieString += `; max-age=${defaultOptions.maxAge}`;
  }

  // Add secure flag
  if (defaultOptions.secure) {
    cookieString += '; secure';
  }

  // Add sameSite
  if (defaultOptions.sameSite) {
    cookieString += `; samesite=${defaultOptions.sameSite}`;
  }

  // Add httpOnly (note: this won't work from client-side JS, but included for completeness)
  if (defaultOptions.httpOnly) {
    cookieString += '; httponly';
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

/**
 * Remove a cookie by setting it to expire in the past
 * @param {string} name - Cookie name
 * @param {Object} options - Cookie options (path, domain)
 */
export const removeCookie = (name, options = {}) => {
  const defaultOptions = {
    path: '/',
    ...options
  };

  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  if (defaultOptions.path) {
    cookieString += `; path=${defaultOptions.path}`;
  }

  if (defaultOptions.domain) {
    cookieString += `; domain=${defaultOptions.domain}`;
  }

  document.cookie = cookieString;
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - True if cookie exists
 */
export const cookieExists = (name) => {
  return getCookie(name) !== null;
};

/**
 * Get all cookies as an object
 * @returns {Object} - Object with cookie names as keys and values as values
 */
export const getAllCookies = () => {
  const cookies = {};
  if (document.cookie) {
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
};

/**
 * Clear all cookies (by removing each one)
 * Note: This only removes cookies for the current path and domain
 */
export const clearAllCookies = () => {
  const cookies = getAllCookies();
  Object.keys(cookies).forEach(name => {
    removeCookie(name);
  });
};

// Token-specific cookie management with security settings
// Updated: All tokens now expire in 15 minutes for enhanced security
const TOKEN_COOKIE_OPTIONS = {
  maxAge: 15 * 60, // 15 minutes in seconds
  secure: window.location.protocol === 'https:',
  sameSite: 'strict'
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: 15 * 60, // 15 minutes in seconds for refresh token
  secure: window.location.protocol === 'https:',
  sameSite: 'strict'
};

const USER_DATA_COOKIE_OPTIONS = {
  maxAge: 15 * 60, // 15 minutes in seconds
  secure: window.location.protocol === 'https:',
  sameSite: 'strict'
};

/**
 * Set authentication token in cookie
 * @param {string} token - JWT token
 */
export const setAuthTokenCookie = (token) => {
  setCookie('authToken', token, TOKEN_COOKIE_OPTIONS);
};

/**
 * Get authentication token from cookie
 * @returns {string|null} - JWT token or null
 */
export const getAuthTokenCookie = () => {
  return getCookie('authToken');
};

/**
 * Remove authentication token cookie
 */
export const removeAuthTokenCookie = () => {
  removeCookie('authToken');
};

/**
 * Set refresh token in cookie
 * @param {string} token - Refresh token
 */
export const setRefreshTokenCookie = (token) => {
  setCookie('refreshToken', token, REFRESH_TOKEN_COOKIE_OPTIONS);
};

/**
 * Get refresh token from cookie
 * @returns {string|null} - Refresh token or null
 */
export const getRefreshTokenCookie = () => {
  return getCookie('refreshToken');
};

/**
 * Remove refresh token cookie
 */
export const removeRefreshTokenCookie = () => {
  removeCookie('refreshToken');
};

/**
 * Set user data in cookie (as JSON string)
 * @param {Object} userData - User data object
 */
export const setUserDataCookie = (userData) => {
  setCookie('userData', JSON.stringify(userData), USER_DATA_COOKIE_OPTIONS);
};

/**
 * Get user data from cookie (parsed from JSON)
 * @returns {Object|null} - User data object or null
 */
export const getUserDataCookie = () => {
  const userData = getCookie('userData');
  try {
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from cookie:', error);
    removeUserDataCookie(); // Remove corrupted cookie
    return null;
  }
};

/**
 * Remove user data cookie
 */
export const removeUserDataCookie = () => {
  removeCookie('userData');
};

/**
 * Set cart data in cookie (as JSON string)
 * @param {string} cartType - Type of cart ('buyCart', 'sellCart', 'cart')
 * @param {Array} cartData - Cart data array
 */
export const setCartCookie = (cartType, cartData) => {
  const cookieName = `campusDeals${cartType.charAt(0).toUpperCase() + cartType.slice(1)}`;
  setCookie(cookieName, JSON.stringify(cartData), {
    maxAge: 15 * 60, // 15 minutes for cart data
    secure: window.location.protocol === 'https:',
    sameSite: 'strict'
  });
};

/**
 * Get cart data from cookie (parsed from JSON)
 * @param {string} cartType - Type of cart ('buyCart', 'sellCart', 'cart')
 * @returns {Array} - Cart data array
 */
export const getCartCookie = (cartType) => {
  const cookieName = `campusDeals${cartType.charAt(0).toUpperCase() + cartType.slice(1)}`;
  const cartData = getCookie(cookieName);
  try {
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error(`Error parsing ${cartType} data from cookie:`, error);
    removeCartCookie(cartType); // Remove corrupted cookie
    return [];
  }
};

/**
 * Remove cart data cookie
 * @param {string} cartType - Type of cart ('buyCart', 'sellCart', 'cart')
 */
export const removeCartCookie = (cartType) => {
  const cookieName = `campusDeals${cartType.charAt(0).toUpperCase() + cartType.slice(1)}`;
  removeCookie(cookieName);
};

/**
 * Clear all authentication-related cookies
 */
export const clearAuthCookies = () => {
  removeAuthTokenCookie();
  removeRefreshTokenCookie();
  removeUserDataCookie();
  removeCartCookie('buyCart');
  removeCartCookie('sellCart');
  removeCartCookie('cart');
};