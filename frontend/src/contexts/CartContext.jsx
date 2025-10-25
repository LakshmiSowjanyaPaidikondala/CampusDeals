import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  // Buy cart APIs
  addToBuyCartAPI,
  getBuyCartItemsAPI,
  updateBuyCartItemAPI,
  removeFromBuyCartAPI,
  clearBuyCartAPI,
  // Sell cart APIs
  addToSellCartAPI,
  getSellCartItemsAPI,
  updateSellCartItemAPI,
  removeFromSellCartAPI,
  clearSellCartAPI,
  // Utilities
  transformCartItem
} from '../services/cartService';
import { getCartCookie, setCartCookie } from '../utils/cookies.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Initialize carts from cookies or with empty arrays
  const [buyCartItems, setBuyCartItems] = useState(() => {
    return getCartCookie('buyCart');
  });

  const [sellCartItems, setSellCartItems] = useState(() => {
    return getCartCookie('sellCart');
  });
  
  // Loading and error states
  const [isLoadingBuyCart, setIsLoadingBuyCart] = useState(false);
  const [isLoadingSellCart, setIsLoadingSellCart] = useState(false);
  const [buyCartError, setBuyCartError] = useState(null);
  const [sellCartError, setSellCartError] = useState(null);
  
  // For backward compatibility - combine both carts for components that still use cartItems
  const [cartItems, setCartItems] = useState([]);

  // Update combined cartItems whenever individual carts change
  useEffect(() => {
    setCartItems([...buyCartItems, ...sellCartItems]);
  }, [buyCartItems, sellCartItems]);

  // Save carts to cookies for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setCartCookie('buyCart', buyCartItems);
    }
  }, [buyCartItems, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCookie('sellCart', sellCartItems);
    }
  }, [sellCartItems, isAuthenticated]);

  // Load carts from backend on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadBuyCartFromBackend();
      loadSellCartFromBackend();
    } else {
      // Load from cookies for unauthenticated users
      loadCartsFromCookies();
    }
  }, [isAuthenticated]);

  // Load carts from cookies (for unauthenticated users)
  const loadCartsFromCookies = () => {
    const savedBuyCart = getCartCookie('buyCart');
    const savedSellCart = getCartCookie('sellCart');
    
    if (savedBuyCart) {
      setBuyCartItems(savedBuyCart);
    }
    if (savedSellCart) {
      setSellCartItems(savedSellCart);
    }
  };

  // ===================
  // BUY CART FUNCTIONS
  // ===================

  // Load buy cart from backend
  const loadBuyCartFromBackend = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingBuyCart(true);
      setBuyCartError(null);
      
      const response = await getBuyCartItemsAPI();
      
      if (response.success && response.data && response.data.items) {
        const transformedItems = response.data.items.map(item => 
          transformCartItem(item, 'buy')
        ).filter(item => item !== null);
        
        setBuyCartItems(transformedItems);
      }
    } catch (error) {
      console.error('Error loading buy cart from backend:', error);
      setBuyCartError(error.message);
      
      // Fallback to cookies if backend fails
      const savedBuyCart = getCartCookie('buyCart');
      if (savedBuyCart) {
        setBuyCartItems(savedBuyCart);
      }
    } finally {
      setIsLoadingBuyCart(false);
    }
  };

  // Add item to buy cart
  const addToBuyCart = async (product) => {
    if (isAuthenticated) {
      try {
        const response = await addToBuyCartAPI(product.id, 1);
        
        if (response.success) {
          // Reload buy cart to get updated state
          await loadBuyCartFromBackend();
        }
      } catch (error) {
        console.error('Error adding to buy cart:', error);
        setBuyCartError(error.message);
        
        // Fallback to local
        addToBuyCartLocal(product);
        throw error;
      }
    } else {
      addToBuyCartLocal(product);
    }
  };

  // Local add to buy cart (for unauthenticated users)
  const addToBuyCartLocal = (product) => {
    setBuyCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.inStock || item.stock || 99) }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1, type: 'buy' }];
    });
  };

  // ====================
  // SELL CART FUNCTIONS
  // ====================

  // Load sell cart from backend
  const loadSellCartFromBackend = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingSellCart(true);
      setSellCartError(null);
      
      const response = await getSellCartItemsAPI();
      
      if (response.success && response.data && response.data.items) {
        const transformedItems = response.data.items.map(item => 
          transformCartItem(item, 'sell')
        ).filter(item => item !== null);
        
        setSellCartItems(transformedItems);
      }
    } catch (error) {
      console.error('Error loading sell cart from backend:', error);
      setSellCartError(error.message);
      
      // Fallback to cookies if backend fails
      const savedSellCart = getCartCookie('sellCart');
      if (savedSellCart) {
        setSellCartItems(savedSellCart);
      }
    } finally {
      setIsLoadingSellCart(false);
    }
  };

  // Add item to sell cart
  const addToSellCart = async (product) => {
    if (isAuthenticated) {
      try {
        const response = await addToSellCartAPI(product.id, 1);
        
        if (response.success) {
          // Reload sell cart to get updated state
          await loadSellCartFromBackend();
        }
      } catch (error) {
        console.error('Error adding to sell cart:', error);
        setSellCartError(error.message);
        
        // Fallback to local
        addToSellCartLocal(product);
        throw error;
      }
    } else {
      addToSellCartLocal(product);
    }
  };

  // Local add to sell cart (for unauthenticated users)
  const addToSellCartLocal = (product) => {
    setSellCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.inStock || item.stock || 99) }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1, type: 'sell' }];
    });
  };

  // Backward compatibility - add to buy cart by default
  const addToCart = (product) => {
    addToBuyCart(product);
  };

  // Remove from buy cart
  const removeFromBuyCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await removeFromBuyCartAPI(productId);
        
        if (response.success) {
          // Reload buy cart to get updated state
          await loadBuyCartFromBackend();
        }
      } catch (error) {
        console.error('Error removing from buy cart:', error);
        setBuyCartError(error.message);
        
        // Fallback to local removal
        removeFromBuyCartLocal(productId);
        throw error;
      }
    } else {
      removeFromBuyCartLocal(productId);
    }
  };

  // Local remove from buy cart
  const removeFromBuyCartLocal = (productId) => {
    setBuyCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Remove from sell cart
  const removeFromSellCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const response = await removeFromSellCartAPI(productId);
        
        if (response.success) {
          // Reload sell cart to get updated state
          await loadSellCartFromBackend();
        }
      } catch (error) {
        console.error('Error removing from sell cart:', error);
        setSellCartError(error.message);
        
        // Fallback to local removal
        removeFromSellCartLocal(productId);
        throw error;
      }
    } else {
      removeFromSellCartLocal(productId);
    }
  };

  // Local remove from sell cart
  const removeFromSellCartLocal = (productId) => {
    setSellCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const removeFromCart = (productId) => {
    // Check which cart contains the item and remove from appropriate cart
    const inBuyCart = buyCartItems.find(item => item.id === productId);
    const inSellCart = sellCartItems.find(item => item.id === productId);

    if (inBuyCart) {
      removeFromBuyCart(productId);
    }
    if (inSellCart) {
      removeFromSellCart(productId);
    }
  };

  // Update buy cart quantity
  const updateBuyQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromBuyCart(productId);
      return;
    }
    
    if (isAuthenticated) {
      try {
        const response = await updateBuyCartItemAPI(productId, newQuantity);
        
        if (response.success) {
          // Reload buy cart to get updated state
          await loadBuyCartFromBackend();
        }
      } catch (error) {
        console.error('Error updating buy cart quantity:', error);
        setBuyCartError(error.message);
        
        // Fallback to local update
        updateBuyQuantityLocal(productId, newQuantity);
        throw error;
      }
    } else {
      updateBuyQuantityLocal(productId, newQuantity);
    }
  };

  // Local update buy cart quantity
  const updateBuyQuantityLocal = (productId, newQuantity) => {
    setBuyCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.inStock || item.stock || 99) }
          : item
      )
    );
  };

  // Update sell cart quantity
  const updateSellQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromSellCart(productId);
      return;
    }
    
    if (isAuthenticated) {
      try {
        const response = await updateSellCartItemAPI(productId, newQuantity);
        
        if (response.success) {
          // Reload sell cart to get updated state
          await loadSellCartFromBackend();
        }
      } catch (error) {
        console.error('Error updating sell cart quantity:', error);
        setSellCartError(error.message);
        
        // Fallback to local update
        updateSellQuantityLocal(productId, newQuantity);
        throw error;
      }
    } else {
      updateSellQuantityLocal(productId, newQuantity);
    }
  };

  // Local update sell cart quantity
  const updateSellQuantityLocal = (productId, newQuantity) => {
    setSellCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.inStock || item.stock || 99) }
          : item
      )
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    // Check which cart contains the item and update appropriate cart
    const inBuyCart = buyCartItems.find(item => item.id === productId);
    const inSellCart = sellCartItems.find(item => item.id === productId);

    if (inBuyCart) {
      updateBuyQuantity(productId, newQuantity);
    }
    if (inSellCart) {
      updateSellQuantity(productId, newQuantity);
    }
  };

  // Clear buy cart
  const clearBuyCart = async () => {
    if (isAuthenticated) {
      try {
        const response = await clearBuyCartAPI();
        
        if (response.success) {
          setBuyCartItems([]);
        }
      } catch (error) {
        console.error('Error clearing buy cart:', error);
        setBuyCartError(error.message);
        
        // Fallback to local clear
        setBuyCartItems([]);
        throw error;
      }
    } else {
      setBuyCartItems([]);
    }
  };

  // Clear sell cart
  const clearSellCart = async () => {
    if (isAuthenticated) {
      try {
        const response = await clearSellCartAPI();
        
        if (response.success) {
          setSellCartItems([]);
        }
      } catch (error) {
        console.error('Error clearing sell cart:', error);
        setSellCartError(error.message);
        
        // Fallback to local clear
        setSellCartItems([]);
        throw error;
      }
    } else {
      setSellCartItems([]);
    }
  };

  const clearCart = () => {
    clearBuyCart();
    clearSellCart();
  };

  const getBuyCartCount = () => {
    return buyCartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSellCartCount = () => {
    return sellCartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartCount = () => {
    return getBuyCartCount() + getSellCartCount();
  };

  const getBuyCartTotal = () => {
    return buyCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSellCartTotal = () => {
    return sellCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    return getBuyCartTotal() + getSellCartTotal();
  };

  const value = {
    // Individual carts
    buyCartItems,
    sellCartItems,
    // Combined cart for backward compatibility
    cartItems,
    
    // Loading states
    isLoadingBuyCart,
    isLoadingSellCart,
    
    // Error states
    buyCartError,
    sellCartError,
    
    // Load functions
    loadBuyCartFromBackend,
    loadSellCartFromBackend,
    
    // Add functions
    addToBuyCart,
    addToSellCart,
    addToCart, // defaults to buy cart
    
    // Remove functions
    removeFromBuyCart,
    removeFromSellCart,
    removeFromCart,
    
    // Update functions
    updateBuyQuantity,
    updateSellQuantity,
    updateQuantity,
    
    // Clear functions
    clearBuyCart,
    clearSellCart,
    clearCart,
    
    // Count functions
    getBuyCartCount,
    getSellCartCount,
    getCartCount,
    
    // Total functions
    getBuyCartTotal,
    getSellCartTotal,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};