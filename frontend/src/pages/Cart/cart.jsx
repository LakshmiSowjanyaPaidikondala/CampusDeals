import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './cart.css';
import Drafter from "../../assets/Drafter.jpeg";
import Calculator from "../../assets/Calci.jpg";
import MechanicalCoat from "../../assets/Mechanical.jpeg";
import ChartHolder from "../../assets/chart holder.jpg";
import Chemical from "../../assets/Chemical.jpeg";



const Cart = () => {
  const navigate = useNavigate();
  const { cartItems: contextCartItems, updateQuantity: updateContextQuantity, removeFromCart: removeFromContext, clearCart } = useCart();
  
  // Use cart items from context, or show sample data if cart is empty (for demo purposes)
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize cart items and selected items
  useEffect(() => {
    if (contextCartItems.length > 0) {
      setCartItems(contextCartItems);
      setSelectedItems(contextCartItems.map(item => item.id));
    } else {
      // Sample cart items for demo (remove this in production)
      const sampleItems = [
        {
          id: 1,
          name: 'Premium Drafter Set',
          category: 'Drafters',
          subcategory: 'Premium',
          price: 2500,
          originalPrice: 3200,
          image: Drafter,
          description: 'Professional grade drafter with precision tools and compass set',
          seller: 'Final Year - Mechanical',
          quantity: 1,
          inStock: 3
        },
        {
          id: 2,
          name: 'Scientific Calculator',
          category: 'Calculators',
          price: 1200,
          originalPrice: 1500,
          image: Calculator,
          description: 'Advanced scientific calculator with 240+ functions',
          seller: 'Third Year - ECE',
          quantity: 2,
          inStock: 5
        }
      ];
      setCartItems(sampleItems);
      setSelectedItems(sampleItems.map(item => item.id));
    }
  }, [contextCartItems]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
      return;
    }
    updateContextQuantity(id, newQuantity);
  };

  const removeFromCart = (id) => {
    removeFromContext(id);
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
      // Reset after success animation
      setTimeout(() => {
        setShowSuccess(false);
        clearCart();
        setCartItems([]);
        setSelectedItems([]);
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

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-content">
            <ShoppingBag size={80} className="empty-cart-icon" />
            <h2>Your cart is empty!</h2>
            <p>Add some items to get started</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/buy')}>
              <ArrowLeft size={20} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="item-count">{cartItems.length} items</span>
          </div>
          <div className="campus-badge">Campus Deals</div>
        </div>
      </div>

      <div className="cart-content">
        {/* Left Section - Cart Items */}
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
                      <span className="seller">Sold by: <strong>{item.seller}</strong></span>
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
              BUY NOW
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
          BUY NOW
        </button>
      </div>
    </div>
  );
};

export default Cart;