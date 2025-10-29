import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buyCartAPI, sellCartAPI, cartAPI } from '../utils/cartApi.js';
import { useAuth } from '../hooks/useAuth.jsx';

// Import images for cart items
import calciImg from '../assets/Calci.jpg';
import drafterImg from '../assets/Drafter.jpeg';
import chartHolderImg from '../assets/chart holder.jpg';
import mechCoatImg from '../assets/Mechanical.jpeg';
import chemCoatImg from '../assets/Chemical.jpeg';

const CartContext = createContext();

// Image mapping for products (same as in Buy/Sell pages)
const productImages = {
  calculator: calciImg,
  drafter: drafterImg,
  chartbox: chartHolderImg,
  white_lab_coat: chemCoatImg,
  brown_lab_coat: mechCoatImg
};

// Helper function to get product image
const getProductImage = (productName) => {
  return productImages[productName] || calciImg;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Initialize separate carts from backend or with empty arrays
  const [buyCartItems, setBuyCartItems] = useState([]);
  const [sellCartItems, setSellCartItems] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false, only set true during actual operations
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous fetches

  // For backward compatibility - combine both carts for components that still use cartItems
  const [cartItems, setCartItems] = useState([]);

  // Update combined cartItems whenever individual carts change
  useEffect(() => {
    setCartItems([...buyCartItems, ...sellCartItems]);
  }, [buyCartItems, sellCartItems]);

  // Fetch cart data from backend when user is authenticated
  const fetchCartData = useCallback(async () => {
    if (!isAuthenticated) {
      setBuyCartItems([]);
      setSellCartItems([]);
      setIsFetching(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      setError(null);
      
      const { buyCart, sellCart } = await cartAPI.getAllCarts();
      
      // Ensure we have valid cart data
      const buyItems = buyCart?.items || [];
      const sellItems = sellCart?.items || [];
      
      // Debug logging
      console.log('Raw cart data:', { buyCart, sellCart });
      console.log('Buy items:', buyItems);
      console.log('Sell items:', sellItems);
      
      // Transform backend data to match frontend format
      const transformedBuyItems = buyItems.map(item => {
        console.log('Transforming buy item:', item);
        const price = parseFloat(item.price_per_item) || 0;
        return {
          id: item.product_id,
          name: item.product_name,
          product_name: item.product_name,
          variant: item.product_variant,
          product_variant: item.product_variant,
          price: price,
          originalPrice: price ? price * 1.2 : 0, // Add some markup for display
          quantity: parseInt(item.quantity) || 0,
          inStock: 99, // You may want to get this from backend
          stock: 99,
          type: 'buy',
          image: getProductImage(item.product_name),
          product_images: getProductImage(item.product_name),
          productCode: item.product_code,
          product_code: item.product_code,
          category: item.product_name,
          subcategory: item.product_variant,
          seller: 'Campus Deals'
        };
      });

      const transformedSellItems = sellItems.map(item => {
        console.log('Transforming sell item:', item);
        const price = parseFloat(item.price_per_item) || 0;
        return {
          id: item.product_id,
          name: item.product_name,
          product_name: item.product_name,
          variant: item.product_variant,
          product_variant: item.product_variant,
          price: price,
          originalPrice: price ? price * 1.2 : 0, // Add some markup for display
          quantity: parseInt(item.quantity) || 0,
          inStock: 99, // You may want to get this from backend
          stock: 99,
          type: 'sell',
          image: getProductImage(item.product_name),
          product_images: getProductImage(item.product_name),
          productCode: item.product_code,
          product_code: item.product_code,
          category: item.product_name,
          subcategory: item.product_variant,
          seller: 'Your Items'
        };
      });

      setBuyCartItems(transformedBuyItems);
      setSellCartItems(transformedSellItems);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart data:', err);
      // Set empty arrays on error to prevent undefined errors
      setBuyCartItems([]);
      setSellCartItems([]);
    } finally {
      setIsFetching(false);
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated

  // Fetch cart data when authentication state changes
  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]); // Now properly memoized

  const addToBuyCart = async (product) => {
    if (!isAuthenticated) {
      setError('Please log in to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await buyCartAPI.addItem(product.id || product.product_id, 1);
      
      // Fetch cart data to get complete item details from backend
      // (Add operations need full product data that backend provides)
      await fetchCartData();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error adding to buy cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addToSellCart = async (product) => {
    if (!isAuthenticated) {
      setError('Please log in to add items to cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await sellCartAPI.addItem(product.id || product.product_id, 1);
      
      // Fetch cart data to get complete item details from backend
      // (Add operations need full product data that backend provides)
      await fetchCartData();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error adding to sell cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Backward compatibility - add to buy cart by default
  const addToCart = async (product) => {
    return await addToBuyCart(product);
  };

  const removeFromBuyCart = async (productId) => {
    if (!isAuthenticated) {
      setError('Please log in to remove items from cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await buyCartAPI.removeItem(productId);
      
      // Update local state instead of refetching all data
      setBuyCartItems(prevItems => 
        prevItems.filter(item => item.id !== productId)
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error removing from buy cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromSellCart = async (productId) => {
    if (!isAuthenticated) {
      setError('Please log in to remove items from cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await sellCartAPI.removeItem(productId);
      
      // Update local state instead of refetching all data
      setSellCartItems(prevItems => 
        prevItems.filter(item => item.id !== productId)
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error removing from sell cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    // Check which cart contains the item and remove from appropriate cart
    const inBuyCart = buyCartItems.find(item => item.id === productId);
    const inSellCart = sellCartItems.find(item => item.id === productId);

    if (inBuyCart) {
      return await removeFromBuyCart(productId);
    }
    if (inSellCart) {
      return await removeFromSellCart(productId);
    }
    
    return { success: false, error: 'Item not found in any cart' };
  };

  const updateBuyQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) {
      setError('Please log in to update cart items');
      return;
    }

    if (newQuantity === 0) {
      return await removeFromBuyCart(productId);
    }

    try {
      setLoading(true);
      setError(null);
      
      await buyCartAPI.updateItem(productId, newQuantity);
      
      // Update local state instead of refetching all data
      setBuyCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error updating buy cart quantity:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateSellQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) {
      setError('Please log in to update cart items');
      return;
    }

    if (newQuantity === 0) {
      return await removeFromSellCart(productId);
    }

    try {
      setLoading(true);
      setError(null);
      
      await sellCartAPI.updateItem(productId, newQuantity);
      
      // Update local state instead of refetching all data
      setSellCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error updating sell cart quantity:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // Check which cart contains the item and update appropriate cart
    const inBuyCart = buyCartItems.find(item => item.id === productId);
    const inSellCart = sellCartItems.find(item => item.id === productId);

    if (inBuyCart) {
      return await updateBuyQuantity(productId, newQuantity);
    }
    if (inSellCart) {
      return await updateSellQuantity(productId, newQuantity);
    }
    
    return { success: false, error: 'Item not found in any cart' };
  };

  const clearBuyCart = async () => {
    if (!isAuthenticated) {
      setError('Please log in to clear cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await buyCartAPI.clearCart();
      
      // Clear local state instead of refetching
      setBuyCartItems([]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error clearing buy cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearSellCart = async () => {
    if (!isAuthenticated) {
      setError('Please log in to clear cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await sellCartAPI.clearCart();
      
      // Clear local state instead of refetching
      setSellCartItems([]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error clearing sell cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const buyResult = await clearBuyCart();
    const sellResult = await clearSellCart();
    
    return {
      success: buyResult.success && sellResult.success,
      buyResult,
      sellResult
    };
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
    // Loading and error states
    loading,
    isFetching,
    error,
    // Utility functions
    fetchCartData,
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
