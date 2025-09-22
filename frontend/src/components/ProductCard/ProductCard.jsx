import React, { useState, useRef, useEffect } from "react";
import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Drafter options
  const drafterOptions = [
    { type: "Budget Friendly", price: 300, description: "Basic functionality" },
    { type: "Standard", price: 350, description: "Good quality & durability" },
    { type: "Premium", price: 400, description: "Professional grade" },
  ];

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

  const handleAddToCart = () => {
    if (product.name === "drafter" || product.name?.includes("drafter")) {
      setShowDropdown(!showDropdown);
    } else {
      onAddToCart(product); // ✅ send product to Buy.jsx
    }
  };

  const handleOptionSelect = (option) => {
    const selectedDrafter = {
      ...product,
      name: `${option.type} Drafter`,
      price: option.price,
      id: `${product.id}-${option.type.toLowerCase().replace(/\s+/g, '-')}`,
    };
    onAddToCart(selectedDrafter); // ✅ send selected option
    setShowDropdown(false);
  };

  const isDrafter = product.name === "drafter" || product.name?.includes("drafter");

  return (
    <div className={`product-card ${product.loading ? 'loading' : ''} ${product.error ? 'error' : ''} ${showDropdown ? 'dropdown-active' : ''}`}>
      <img 
        src={product.image} 
        alt={product.name} 
        className="product-image"
        loading="lazy"
      />
      <div className="product-details">
        <h3 className="product-name">
          {"Product: " + (product.name || "Unknown Product")}
          {product.variant && ` (${product.variant})`}
        </h3>
        <p className="product-price">{"Price: ₹" + (product.price || 0)}</p>
        <p className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
          {product.stock > 0 ? `${product.stock} items left` : 'Out of stock'}
        </p>
      </div>

      {isDrafter ? (
        <div className="drafter-dropdown" ref={dropdownRef}>
          <button 
            className={`dropdown-toggle ${showDropdown ? 'open' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Choose Drafter Type
            <span className="dropdown-arrow">▼</span>
          </button>
          
          <div className={`dropdown-menu ${showDropdown ? 'open' : ''}`}>
            {drafterOptions.map((option, index) => (
              <button
                key={index}
                className="dropdown-option"
                onClick={() => handleOptionSelect(option)}
              >
                <div>
                  <strong>{option.type}</strong> – ₹{option.price}
                  <br />
                  <small>{option.description}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button 
          className="add-to-cart" 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      )}
    </div>
  );
};

export default ProductCard;
