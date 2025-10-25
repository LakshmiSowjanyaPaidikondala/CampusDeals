// Migration utility to move data from localStorage to cookies
// This will run once to ensure smooth transition for existing users

import {
  setAuthTokenCookie,
  setRefreshTokenCookie,
  setUserDataCookie,
  setCartCookie,
  getAuthTokenCookie,
  getUserDataCookie
} from './cookies.js';

/**
 * Migrate authentication data from localStorage to cookies
 * This should be called once when the app loads to ensure smooth transition
 */
export const migrateLocalStorageToCookies = () => {
  try {
    console.log('🔄 Starting migration from localStorage to cookies...');

    // Only migrate if cookies don't already exist (to avoid overwriting)
    const existingToken = getAuthTokenCookie();
    const existingUser = getUserDataCookie();

    if (existingToken || existingUser) {
      console.log('✅ Cookies already exist, skipping migration');
      return;
    }

    let migrationCount = 0;

    // Migrate auth token
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setAuthTokenCookie(authToken);
      localStorage.removeItem('authToken');
      migrationCount++;
      console.log('✅ Migrated authToken');
    }

    // Also check for alternative token keys
    const token = localStorage.getItem('token');
    if (token && !authToken) {
      setAuthTokenCookie(token);
      localStorage.removeItem('token');
      migrationCount++;
      console.log('✅ Migrated token');
    }

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !authToken && !token) {
      setAuthTokenCookie(accessToken);
      localStorage.removeItem('accessToken');
      migrationCount++;
      console.log('✅ Migrated accessToken');
    }

    // Migrate refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      setRefreshTokenCookie(refreshToken);
      localStorage.removeItem('refreshToken');
      migrationCount++;
      console.log('✅ Migrated refreshToken');
    }

    // Migrate user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUserDataCookie(parsedUserData);
        localStorage.removeItem('userData');
        migrationCount++;
        console.log('✅ Migrated userData');
      } catch (error) {
        console.error('❌ Failed to parse userData during migration:', error);
        localStorage.removeItem('userData'); // Remove corrupted data
      }
    }

    // Also check for alternative user data keys
    const user = localStorage.getItem('user');
    if (user && !userData) {
      try {
        const parsedUser = JSON.parse(user);
        setUserDataCookie(parsedUser);
        localStorage.removeItem('user');
        migrationCount++;
        console.log('✅ Migrated user');
      } catch (error) {
        console.error('❌ Failed to parse user during migration:', error);
        localStorage.removeItem('user');
      }
    }

    const userProfile = localStorage.getItem('userProfile');
    if (userProfile && !userData && !user) {
      try {
        const parsedUserProfile = JSON.parse(userProfile);
        setUserDataCookie(parsedUserProfile);
        localStorage.removeItem('userProfile');
        migrationCount++;
        console.log('✅ Migrated userProfile');
      } catch (error) {
        console.error('❌ Failed to parse userProfile during migration:', error);
        localStorage.removeItem('userProfile');
      }
    }

    // Migrate cart data
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      try {
        const parsedCartItems = JSON.parse(cartItems);
        setCartCookie('cart', parsedCartItems);
        localStorage.removeItem('cartItems');
        migrationCount++;
        console.log('✅ Migrated cartItems');
      } catch (error) {
        console.error('❌ Failed to parse cartItems during migration:', error);
        localStorage.removeItem('cartItems');
      }
    }

    // Migrate specific cart types
    const buyCart = localStorage.getItem('campusDealsBuyCart');
    if (buyCart) {
      try {
        const parsedBuyCart = JSON.parse(buyCart);
        setCartCookie('buyCart', parsedBuyCart);
        localStorage.removeItem('campusDealsBuyCart');
        migrationCount++;
        console.log('✅ Migrated campusDealsBuyCart');
      } catch (error) {
        console.error('❌ Failed to parse buyCart during migration:', error);
        localStorage.removeItem('campusDealsBuyCart');
      }
    }

    const sellCart = localStorage.getItem('campusDealsSellCart');
    if (sellCart) {
      try {
        const parsedSellCart = JSON.parse(sellCart);
        setCartCookie('sellCart', parsedSellCart);
        localStorage.removeItem('campusDealsSellCart');
        migrationCount++;
        console.log('✅ Migrated campusDealsSellCart');
      } catch (error) {
        console.error('❌ Failed to parse sellCart during migration:', error);
        localStorage.removeItem('campusDealsSellCart');
      }
    }

    // Also migrate generic cart
    const cart = localStorage.getItem('cart');
    if (cart && !cartItems) {
      try {
        const parsedCart = JSON.parse(cart);
        setCartCookie('cart', parsedCart);
        localStorage.removeItem('cart');
        migrationCount++;
        console.log('✅ Migrated cart');
      } catch (error) {
        console.error('❌ Failed to parse cart during migration:', error);
        localStorage.removeItem('cart');
      }
    }

    if (migrationCount > 0) {
      console.log(`🎉 Migration completed! Successfully migrated ${migrationCount} items from localStorage to cookies`);
      
      // Optional: Show user notification about the migration
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          console.log('📱 Migration completed - your session data has been securely moved to cookies');
        }, 1000);
      }
    } else {
      console.log('ℹ️ No data found to migrate');
    }

  } catch (error) {
    console.error('❌ Error during localStorage to cookies migration:', error);
  }
};

/**
 * Clean up any remaining localStorage keys that might be related to auth
 * This is a more aggressive cleanup for users who want to completely clear old data
 */
export const cleanupLegacyLocalStorage = () => {
  const authKeys = [
    'authToken', 'token', 'accessToken', 'refreshToken',
    'userData', 'user', 'userProfile',
    'cartItems', 'cart', 'campusDealsBuyCart', 'campusDealsSellCart'
  ];

  let cleanedCount = 0;
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleanedCount++;
    }
  });

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} legacy localStorage keys`);
  }
};

/**
 * Initialize migration on app start
 * This should be called once when the app loads
 */
export const initializeMigration = () => {
  // Only run migration if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    migrateLocalStorageToCookies();
  }
};