import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Check, ShoppingCart, Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './cart.css';

// Memoized cart item component for better performance
const CartItem = React.memo(({ item, onUpdateQuantity, onRemoveItem, isLoading, getDiscountPercentage }) => {
  return (
    <>
      <div className="item-image-container">
        <img
          src={item.image || item.product_images || '/default-product.jpg'}
          alt={item.name || item.product_name || 'Product'}
          className="item-image"
          onError={(e) => {
            e.target.src = '/default-product.jpg';
          }}
        />
        {item.originalPrice && item.originalPrice > (item.price || 0) && (
          <div className="discount-badge">
            {getDiscountPercentage(item.originalPrice || 0, item.price || 0)}% OFF
          </div>
        )}
      </div>

      <div className="item-details">
        <div className="item-info">
          <h3 className="item-name">{item.name || item.product_name || 'Unknown Product'}</h3>
          <p className="item-description">{item.description || `${item.name || ''} - ${item.variant || ''}`}</p>
          
          <div className="item-meta">
            <span className="category-badge">{item.subcategory || item.category || 'General'}</span>
          </div>
        </div>

        <div className="item-actions">
          <div className="price-section">
            <div className="current-price">₹{(item.price || 0).toLocaleString()}</div>
            {item.originalPrice && item.originalPrice > (item.price || 0) && (
              <div className="original-price">₹{(item.originalPrice || 0).toLocaleString()}</div>
            )}
          </div>

          <div className="quantity-controls">
            <button
              type="button"
              className="qty-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpdateQuantity(item.id, Math.max(0, (item.quantity || 1) - 1));
              }}
              disabled={isLoading}
            >
              <Minus size={16} />
            </button>
            <span className="quantity">{item.quantity || 0}</span>
            <button
              type="button"
              className="qty-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpdateQuantity(item.id, (item.quantity || 0) + 1);
              }}
              disabled={isLoading}
            >
              <Plus size={16} />
            </button>
          </div>

          <button 
            type="button"
            className="remove-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoveItem(item.id);
            }}
            disabled={isLoading}
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </>
  );
});



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
    loading: cartLoading,
    isFetching,
    error: cartError,
    fetchCartData
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
    
    // Only update if the items actually changed to prevent unnecessary re-renders
    setCartItems(prevItems => {
      if (JSON.stringify(prevItems) !== JSON.stringify(currentCartItems)) {
        return currentCartItems;
      }
      return prevItems;
    });
    
    setSelectedItems(prevSelected => {
      const newSelected = currentCartItems.map(item => item.id);
      if (JSON.stringify(prevSelected) !== JSON.stringify(newSelected)) {
        return newSelected;
      }
      return prevSelected;
    });
  }, [buyCartItems, sellCartItems, activeTab]);

  // Show cart errors (handled by context, but we can add additional handling if needed)
  useEffect(() => {
    if (cartError) {
      console.error('Cart error:', cartError);
      // Error display is handled by the CartContext and shown via toasts in Buy/Sell pages
    }
  }, [cartError]);

  const updateQuantity = useCallback(async (id, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromCart(id);
      return;
    }
    
    // Optimistic update - update UI immediately
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    
    try {
      // Update in appropriate cart based on active tab
      let result;
      if (activeTab === 'buy') {
        result = await updateBuyQuantity(id, newQuantity);
      } else {
        result = await updateSellQuantity(id, newQuantity);
      }
      
      if (!result.success) {
        console.error('Failed to update quantity:', result.error);
        // Revert optimistic update on error
        const currentCartItems = activeTab === 'buy' ? buyCartItems : sellCartItems;
        setCartItems(currentCartItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert optimistic update on error
      const currentCartItems = activeTab === 'buy' ? buyCartItems : sellCartItems;
      setCartItems(currentCartItems);
    }
  }, [activeTab, updateBuyQuantity, updateSellQuantity, buyCartItems, sellCartItems]);

  const removeFromCart = useCallback(async (id) => {
    // Optimistic update - remove from UI immediately
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    
    try {
      // Remove from appropriate cart based on active tab
      let result;
      if (activeTab === 'buy') {
        result = await removeFromBuyCart(id);
      } else {
        result = await removeFromSellCart(id);
      }
      
      if (!result.success) {
        console.error('Failed to remove item:', result.error);
        // Revert optimistic update on error
        const currentCartItems = activeTab === 'buy' ? buyCartItems : sellCartItems;
        setCartItems(currentCartItems);
        setSelectedItems(currentCartItems.map(item => item.id));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert optimistic update on error
      const currentCartItems = activeTab === 'buy' ? buyCartItems : sellCartItems;
      setCartItems(currentCartItems);
      setSelectedItems(currentCartItems.map(item => item.id));
    }
  }, [activeTab, removeFromBuyCart, removeFromSellCart, buyCartItems, sellCartItems]);

  const toggleItemSelection = useCallback((id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const selectedItems_memo = useMemo(() => {
    return cartItems.filter(item => selectedItems.includes(item.id));
  }, [cartItems, selectedItems]);

  const totalPrice = useMemo(() => {
    return selectedItems_memo.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
  }, [selectedItems_memo]);

  const totalOriginalPrice = useMemo(() => {
    return selectedItems_memo.reduce((total, item) => total + ((item.originalPrice || item.price || 0) * (item.quantity || 0)), 0);
  }, [selectedItems_memo]);

  const totalSavings = useMemo(() => {
    return Math.max(0, totalOriginalPrice - totalPrice);
  }, [totalOriginalPrice, totalPrice]);

  const totalItems = useMemo(() => {
    return selectedItems_memo.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [selectedItems_memo]);

  const getDiscountPercentage = (original, current) => {
    if (!original || original <= 0 || !current || current < 0) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handleBuyNow = async () => {
    try {
      setIsLoading(true);
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setShowSuccess(true);
      
      // Clear appropriate cart from context after success
      setTimeout(async () => {
        try {
          if (activeTab === 'buy') {
            await clearBuyCart();
          } else {
            await clearSellCart();
          }
          
          // Clear local state
          setCartItems([]);
          setSelectedItems([]);
          setShowSuccess(false);
          
          // Redirect to orders page
          navigate('/orders');
        } catch (error) {
          console.error('Error clearing cart:', error);
          setShowSuccess(false);
          setIsLoading(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Error processing order:', error);
      setIsLoading(false);
    }
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
                <span>{totalItems}</span>
              </div>
              <div className="success-item">
                <span>Total:</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <p className="contact-info">Contact sellers to arrange pickup</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <h2>{isLoading ? 'Processing Your Order...' : 'Loading Cart...'}</h2>
          <p>{isLoading ? 'Please wait while we confirm your items' : 'Fetching your cart items'}</p>
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
                <div key={item.id} className="cart-item">
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

                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    isLoading={isLoading}
                    getDiscountPercentage={getDiscountPercentage}
                  />
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
              <span className="selected-count">{totalItems} items selected</span>
            </div>

            <div className="summary-content">
              <div className="summary-row">
                <span>Total MRP</span>
                <span>₹{totalOriginalPrice.toLocaleString()}</span>
              </div>
              
              <div className="summary-row discount-row">
                <span>You Save</span>
                <span className="discount-amount">₹{totalSavings.toLocaleString()}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>

              {totalSavings > 0 && (
                <div className="savings-highlight">
                  You saved ₹{totalSavings.toLocaleString()} on this order!
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
          <div className="mobile-total">₹{totalPrice.toLocaleString()}</div>
          {totalSavings > 0 && (
            <div className="mobile-savings">You save ₹{totalSavings.toLocaleString()}</div>
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