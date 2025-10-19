import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  addToCartAPI, 
  getCartItemsAPI, 
  updateCartItemAPI, 
  removeFromCartAPI, 
  clearCartAPI,
  transformCartItem
} from '../services/cartService';
import { normalizeProductData } from '../utils/imageUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Initialize separate carts from localStorage or with empty arrays
  const [buyCartItems, setBuyCartItems] = useState(() => {
    const savedBuyCart = localStorage.getItem('campusDealsBuyCart');
    return savedBuyCart ? JSON.parse(savedBuyCart) : [];
  });

  const [sellCartItems, setSellCartItems] = useState(() => {
    const savedSellCart = localStorage.getItem('campusDealsSellCart');
    return savedSellCart ? JSON.parse(savedSellCart) : [];
  });

  // Backend cart state
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  // For backward compatibility - combine both carts for components that still use cartItems
  const [cartItems, setCartItems] = useState([]);

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartFromBackend();
    } else {
      // Clear backend cart when user logs out
      setBuyCartItems(prevItems => {
        const savedBuyCart = localStorage.getItem('campusDealsBuyCart');
        return savedBuyCart ? JSON.parse(savedBuyCart) : [];
      });
      setCartError(null);
    }
  }, [isAuthenticated, user]);

  // Update combined cartItems whenever individual carts change
  useEffect(() => {
    setCartItems([...buyCartItems, ...sellCartItems]);
  }, [buyCartItems, sellCartItems]);

  // Load cart items from backend
  const loadCartFromBackend = async () => {
    try {
      setIsLoadingCart(true);
      setCartError(null);
      
      const response = await getCartItemsAPI();
      
      if (response.success && response.data && response.data.items) {
        // Transform backend items to frontend format
        const transformedItems = response.data.items
          .map(item => transformCartItem(item, 'buy')) // All backend items are treated as buy items
          .filter(item => item !== null); // Filter out any null items from failed transformations
        
        setBuyCartItems(transformedItems);
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      setCartError(error.message);
      
      // Fallback to localStorage if backend fails
      const savedBuyCart = localStorage.getItem('campusDealsBuyCart');
      if (savedBuyCart) {
        setBuyCartItems(JSON.parse(savedBuyCart));
      }
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Save carts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('campusDealsBuyCart', JSON.stringify(buyCartItems));
  }, [buyCartItems]);

  useEffect(() => {
    localStorage.setItem('campusDealsSellCart', JSON.stringify(sellCartItems));
  }, [sellCartItems]);

  const addToBuyCart = async (product) => {
    if (isAuthenticated) {
      // Add to backend cart
      try {
        setCartError(null);
        const response = await addToCartAPI(product.id, 1);
        
        if (response.success) {
          // Reload cart from backend to get updated state
          await loadCartFromBackend();
        }
      } catch (error) {
        console.error('Error adding to backend cart:', error);
        setCartError(error.message);
        
        // Fallback to local storage if backend fails
        addToBuyCartLocal(product);
      }
    } else {
      // Add to local storage if not authenticated
      addToBuyCartLocal(product);
    }
  };

  const addToBuyCartLocal = (product) => {
    setBuyCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.inStock || 99) }
            : item
        );
      }
      
      // Add new item with quantity 1
      return [...prevItems, { ...product, quantity: 1, type: 'buy' }];
    });
  };

  const addToSellCart = (product) => {
    // Normalize product data to ensure consistent image handling
    const normalizedProduct = normalizeProductData(product, 'frontend');
    
    setSellCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === normalizedProduct.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.inStock || 99) }
            : item
        );
      }
      
      // Add new item with quantity 1
      return [...prevItems, { ...normalizedProduct, quantity: 1, type: 'sell' }];
    });
  };

  // Backward compatibility - add to buy cart by default
  const addToCart = (product) => {
    addToBuyCart(product);
  };

  const removeFromBuyCart = async (productId) => {
    if (isAuthenticated) {
      // Remove from backend cart
      try {
        setCartError(null);
        await removeFromCartAPI(productId);
        
        // Reload cart from backend to get updated state
        await loadCartFromBackend();
      } catch (error) {
        console.error('Error removing from backend cart:', error);
        setCartError(error.message);
        
        // Fallback to local removal if backend fails
        removeFromBuyCartLocal(productId);
      }
    } else {
      // Remove from local storage if not authenticated
      removeFromBuyCartLocal(productId);
    }
  };

  const removeFromBuyCartLocal = (productId) => {
    setBuyCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const removeFromSellCart = (productId) => {
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

  const updateBuyQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromBuyCart(productId);
      return;
    }
    
    if (isAuthenticated) {
      // Update backend cart
      try {
        setCartError(null);
        await updateCartItemAPI(productId, newQuantity);
        
        // Reload cart from backend to get updated state
        await loadCartFromBackend();
      } catch (error) {
        console.error('Error updating backend cart:', error);
        setCartError(error.message);
        
        // Fallback to local update if backend fails
        updateBuyQuantityLocal(productId, newQuantity);
      }
    } else {
      // Update local storage if not authenticated
      updateBuyQuantityLocal(productId, newQuantity);
    }
  };

  const updateBuyQuantityLocal = (productId, newQuantity) => {
    setBuyCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.inStock || 99) }
          : item
      )
    );
  };

  const updateSellQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromSellCart(productId);
      return;
    }
    
    setSellCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.inStock || 99) }
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

  const clearBuyCart = async () => {
    if (isAuthenticated) {
      // Clear backend cart
      try {
        setCartError(null);
        await clearCartAPI();
        
        // Reload cart from backend to get updated state
        await loadCartFromBackend();
      } catch (error) {
        console.error('Error clearing backend cart:', error);
        setCartError(error.message);
        
        // Fallback to local clear if backend fails
        setBuyCartItems([]);
      }
    } else {
      // Clear local storage if not authenticated
      setBuyCartItems([]);
    }
  };

  const clearSellCart = () => {
    setSellCartItems([]);
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
    // Backend cart state
    isLoadingCart,
    cartError,
    // Backend cart functions
    loadCartFromBackend,
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
