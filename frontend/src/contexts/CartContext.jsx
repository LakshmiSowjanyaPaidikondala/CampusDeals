import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize separate carts from localStorage or with empty arrays
  const [buyCartItems, setBuyCartItems] = useState(() => {
    const savedBuyCart = localStorage.getItem('campusDealsBuyCart');
    return savedBuyCart ? JSON.parse(savedBuyCart) : [];
  });

  const [sellCartItems, setSellCartItems] = useState(() => {
    const savedSellCart = localStorage.getItem('campusDealsSellCart');
    return savedSellCart ? JSON.parse(savedSellCart) : [];
  });

  // For backward compatibility - combine both carts for components that still use cartItems
  const [cartItems, setCartItems] = useState([]);

  // Update combined cartItems whenever individual carts change
  useEffect(() => {
    setCartItems([...buyCartItems, ...sellCartItems]);
  }, [buyCartItems, sellCartItems]);

  // Save carts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('campusDealsBuyCart', JSON.stringify(buyCartItems));
  }, [buyCartItems]);

  useEffect(() => {
    localStorage.setItem('campusDealsSellCart', JSON.stringify(sellCartItems));
  }, [sellCartItems]);

  const addToBuyCart = (product) => {
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
    setSellCartItems(prevItems => {
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
      return [...prevItems, { ...product, quantity: 1, type: 'sell' }];
    });
  };

  // Backward compatibility - add to buy cart by default
  const addToCart = (product) => {
    addToBuyCart(product);
  };

  const removeFromBuyCart = (productId) => {
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

  const updateBuyQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromBuyCart(productId);
      return;
    }

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

  const clearBuyCart = () => {
    setBuyCartItems([]);
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
