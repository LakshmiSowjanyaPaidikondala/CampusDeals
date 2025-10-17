import React, { useState, useRef, useEffect } from "react";
import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Set the first available variant as default
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstAvailableVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
      setSelectedVariant(firstAvailableVariant);
    }
  }, [product.variants]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setShowDropdown(false);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant first');
      return;
    }

    const cartItem = {
      id: selectedVariant.id,
      name: product.name,
      variant: selectedVariant.variant,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      productCode: selectedVariant.productCode,
      image: product.image
    };
    
    onAddToCart(cartItem);
  };

  const formatVariantName = (variant) => {
    // Format variant names for better display
    const formatMap = {
      'premium_drafter': 'Premium Drafter',
      'standard_drafter': 'Standard Drafter', 
      'budget_drafter': 'Budget Drafter',
      'MS': 'MS Calculator',
      'ES': 'ES Calculator',
      'ES-Plus': 'ES-Plus Calculator',
      'chart holder': 'Chart Holder'
    };
    
    // Handle undefined or null variants
    if (!variant) {
      return 'Standard';
    }
    
    return formatMap[variant] || variant.toUpperCase();
  };

  // Check if product has multiple variants
  const hasMultipleVariants = product.variants && product.variants.length > 1;

  return (
    <div className={`product-card ${showDropdown ? 'dropdown-active' : ''}`}>
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          
        />
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-name">
            {product.name.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </h3>
        </div>



        {/* Variant Selection */}
        {hasMultipleVariants ? (
          <div className="variant-selection" ref={dropdownRef}>
            <label className="variant-label">Select Variant:</label>
            <button 
              className={`variant-dropdown-toggle ${showDropdown ? 'open' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="selected-variant">
                {selectedVariant ? formatVariantName(selectedVariant.variant) : 'Choose variant'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            <div className={`variant-dropdown-menu ${showDropdown ? 'open' : ''}`}>
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  className={`variant-option ${selectedVariant?.id === variant.id ? 'selected' : ''} ${variant.stock === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={variant.stock === 0}
                >
                  <div className="variant-info">
                    <div className="variant-name-price">
                      <strong>{variant.variantDetails?.name || formatVariantName(variant.variant)}</strong>
                      <span className="variant-price">₹{variant.price}</span>
                    </div>
                    <div className="variant-details">
                      <small className={`variant-stock ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {variant.stock > 0 ? `${variant.stock} left` : 'Out of stock'}
                      </small>
                    </div>
                    {/* Variant Features */}
                    {variant.variantDetails?.features && Array.isArray(variant.variantDetails.features) && (
                      <div className="variant-features">
                        <small className="features-label">Features:</small>
                        <div className="features-tags">
                          {variant.variantDetails.features.map((feature, fIndex) => (
                            <span key={fIndex} className="feature-tag">{feature}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Best For */}
                    {variant.variantDetails?.bestFor && (
                      <div className="variant-best-for">
                        <small className="best-for-label">Best For:</small>
                        <small className="best-for-text">{variant.variantDetails.bestFor}</small>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

            {/* Selected Variant Info */}
        {selectedVariant && (
          <div className="selected-variant-info">
            <div className="variant-header">
              <h4 className="selected-variant-title">
                {selectedVariant.variantDetails?.name || formatVariantName(selectedVariant.variant)}
              </h4>
              <div className="variant-price-stock">
                <span className="price">₹{selectedVariant.price}</span>
                <span className={`stock ${selectedVariant.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>            {/* Variant Features for single variant or selected variant details */}
            {selectedVariant.variantDetails?.features && Array.isArray(selectedVariant.variantDetails.features) && (
              <div className="selected-variant-features">
                <h5 className="variant-features-title">Key Features:</h5>
                <ul className="variant-features-list">
                  {selectedVariant.variantDetails.features.map((feature, index) => (
                    <li key={index} className="variant-feature-item">✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Best For Section */}
            {selectedVariant.variantDetails?.bestFor && (
              <div className="selected-variant-bestfor">
                <h5 className="bestfor-title">Recommended For:</h5>
                <p className="bestfor-text">{selectedVariant.variantDetails.bestFor}</p>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
        >
          {!selectedVariant 
            ? "Select Variant" 
            : selectedVariant.stock > 0 
              ? "Add to Cart" 
              : "Out of Stock"
          }
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
