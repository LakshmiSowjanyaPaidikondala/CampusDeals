import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Check, ShoppingCart, Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { placeBuyOrder, placeSellOrder } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import './cart.css';



const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    buyCartItems, 
    sellCartItems, 
    updateBuyQuantity,
    updateSellQuantity,
    removeFromBuyCart,
    removeFromSellCart,
    clearBuyCart,
    clearSellCart,
    isLoadingBuyCart,
    isLoadingSellCart,
    buyCartError,
    sellCartError,
    loadBuyCartFromBackend,
    loadSellCartFromBackend
  } = useCart();
  
  // Determine initial tab based on navigation state or which cart has more items
  const getInitialTab = () => {
    // Check if navigation state specifies a tab
    if (location.state?.activeTab) {
      return location.state.activeTab;
    }
    // Check if sell cart has more items
    if (sellCartItems.length > buyCartItems.length) {
      return 'sell';
    }
    return 'buy';
  };
  
  // Cart type state - 'buy' or 'sell'
  const [activeTab, setActiveTab] = useState(getInitialTab);
  
  // Local state for cart items (synced with context)
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize cart items and selected items based on active tab
  useEffect(() => {
    const currentCartItems = activeTab === 'buy' ? buyCartItems : sellCartItems;
    
    if (currentCartItems.length > 0) {
      setCartItems(currentCartItems);
      setSelectedItems(currentCartItems.map(item => item.id));
    } else {
      setCartItems([]);
      setSelectedItems([]);
    }
  }, [buyCartItems, sellCartItems, activeTab]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
      return;
    }
    
    // Update in context based on active tab
    if (activeTab === 'buy') {
      updateBuyQuantity(id, newQuantity);
    } else {
      updateSellQuantity(id, newQuantity);
    }
    
    // Update local state
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    // Remove from context based on active tab
    if (activeTab === 'buy') {
      removeFromBuyCart(id);
    } else {
      removeFromSellCart(id);
    }
    
    // Update local state
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.includes(item.id));
  };

  const getTotalPrice = () => {
    return getSelectedItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalOriginalPrice = () => {
    return getSelectedItems().reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return getTotalOriginalPrice() - getTotalPrice();
  };

  const getTotalItems = () => {
    return getSelectedItems().reduce((total, item) => total + item.quantity, 0);
  };

  const getDiscountPercentage = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleBuyNow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      // Reset after success animation and redirect to orders page
      setTimeout(() => {
        setShowSuccess(false);
        // Clear appropriate cart from context
        if (activeTab === 'buy') {
          clearBuyCart();
        } else {
          clearSellCart();
        }
        // Clear local state
        setCartItems([]);
        setSelectedItems([]);
        // Redirect to orders page
        navigate('/orders');
      }, 3000);
    }, 3500);
  };

  if (showSuccess) {
    return (
      <div className="success-container">
        <div className="success-animation">
          <div className="success-icon">
            <Check size={80} />
          </div>
          <div className="success-content">
            <h1>Order Successful!</h1>
            <p>Your items have been reserved</p>
            <div className="success-details">
              <div className="success-item">
                <span>Items:</span>
                <span>{getTotalItems()}</span>
              </div>
              <div className="success-item">
                <span>Total:</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
            <p className="contact-info">Contact sellers to arrange pickup</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <h2>Processing Your Order...</h2>
          <p>Please wait while we confirm your items</p>
        </div>
      </div>
    );
  }

  const getTotalCartItems = () => {
    return buyCartItems.length + sellCartItems.length;
  };

  // If both carts are empty, show empty cart screen
  if (getTotalCartItems() === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-content">
            <ShoppingBag size={80} className="empty-cart-icon" />
            <h2>Your cart is empty!</h2>
            <p>Add some items to get started</p>
            <div className="empty-cart-buttons">
              <button className="continue-shopping-btn" onClick={() => navigate('/buy')}>
                <ShoppingCart size={20} />
                Shop Products
              </button>
              <button className="continue-shopping-btn" onClick={() => navigate('/sell')}>
                <Tag size={20} />
                Sell Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If current tab is empty but other tab has items, show tab-specific empty state
  const renderTabEmptyState = () => {
    if (cartItems.length === 0) {
      const isEmptyBuyTab = activeTab === 'buy';
      return (
        <div className="cart-items-section">
          <div className="empty-tab-content">
            <div className="empty-tab-icon">
              {isEmptyBuyTab ? <ShoppingCart size={60} /> : <Tag size={60} />}
            </div>
            <h3>Your {activeTab} cart is empty!</h3>
            <p>
              {isEmptyBuyTab 
                ? "Browse products to add items to your buy cart" 
                : "Add items you want to sell to your sell cart"
              }
            </p>
            <button 
              className="continue-shopping-btn" 
              onClick={() => navigate(isEmptyBuyTab ? '/buy' : '/sell')}
            >
              {isEmptyBuyTab ? <ShoppingCart size={18} /> : <Tag size={18} />}
              {isEmptyBuyTab ? 'Shop Products' : 'Sell Products'}
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-content">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className="header-info">
            <h1>My Cart</h1>
            <span className="item-count">{getTotalCartItems()} total items</span>
          </div>
          <div className="campus-badge">Campus Deals</div>
        </div>
      </div>

      {/* Cart Type Tabs */}
      <div className="cart-tabs">
        <button 
          className={`cart-tab ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => setActiveTab('buy')}
        >
          <ShoppingCart size={18} />
          <span>Buy Cart ({buyCartItems.length})</span>
        </button>
        <button 
          className={`cart-tab ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => setActiveTab('sell')}
        >
          <Tag size={18} />
          <span>Sell Cart ({sellCartItems.length})</span>
        </button>
      </div>

      <div className="cart-content">
        {/* Left Section - Cart Items */}
        {renderTabEmptyState() || (
          <div className="cart-items-section">
            {/* Select All */}
            <div className="select-all-section">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartItems.length}
                  onChange={(e) =>
                    setSelectedItems(e.target.checked ? cartItems.map(item => item.id) : [])
                  }
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  Select All ({cartItems.length} items)
                </span>
              </label>
            </div>

            {/* Cart Items */}
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={`${activeTab}-${item.id}`} className="cart-item">
                  <div className="item-selection">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                    {item.originalPrice > item.price && (
                      <div className="discount-badge">
                        {getDiscountPercentage(item.originalPrice, item.price)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="item-details">
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-description">{item.description}</p>
                      
                      <div className="item-meta">
                       
                        <span className="category-badge">{item.subcategory || item.category}</span>
                        <span className="stock-info">Only {item.inStock} left</span>
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="price-section">
                        <div className="current-price">₹{item.price.toLocaleString()}</div>
                        {item.originalPrice > item.price && (
                          <div className="original-price">₹{item.originalPrice.toLocaleString()}</div>
                        )}
                      </div>

                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.inStock}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Section - Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <span className="selected-count">{getTotalItems()} items selected</span>
            </div>

            <div className="summary-content">
              <div className="summary-row">
                <span>Total MRP</span>
                <span>₹{getTotalOriginalPrice().toLocaleString()}</span>
              </div>
              
              <div className="summary-row discount-row">
                <span>You Save</span>
                <span className="discount-amount">₹{getTotalSavings().toLocaleString()}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>

              {getTotalSavings() > 0 && (
                <div className="savings-highlight">
                  You saved ₹{getTotalSavings().toLocaleString()} on this order!
                </div>
              )}
            </div>

            <button 
              className="buy-now-btn"
              disabled={selectedItems.length === 0}
              onClick={handleBuyNow}
            >
              {activeTab === 'buy' ? 'BUY NOW' : 'SELL NOW'}
            </button>

            <div className="campus-info">
              <p>📍 Campus Pickup Only</p>
              <p>💸 Pay on Pickup</p>
              <p>🤝 Direct from Seniors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="mobile-bottom-bar">
        <div className="mobile-price-info">
          <div className="mobile-total">₹{getTotalPrice().toLocaleString()}</div>
          {getTotalSavings() > 0 && (
            <div className="mobile-savings">You save ₹{getTotalSavings().toLocaleString()}</div>
          )}
        </div>
        <button 
          className="mobile-buy-now-btn"
          disabled={selectedItems.length === 0}
          onClick={handleBuyNow}
        >
          {activeTab === 'buy' ? 'BUY NOW' : 'SELL NOW'}
        </button>
      </div>
    </div>
  );
};

export default Cart;