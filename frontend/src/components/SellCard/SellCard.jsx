import React, { useState, useRef, useEffect } from "react";
import "./SellCard.css";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";

const SellCard = ({ product, onEditProduct, onDeleteProduct, onViewDetails, isOwner = false }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleActionsClick = () => {
    setShowActions(!showActions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'sold': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`sell-card ${product.loading ? 'loading' : ''} ${product.error ? 'error' : ''}`}>
      <div className="sell-card-image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="sell-card-image"
          loading="lazy"
        />
        <div className="sell-card-overlay">
          <span 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(product.status) }}
          >
            {(product.status || 'available').toUpperCase()}
          </span>
          {isOwner && (
            <div className="owner-actions" ref={actionsRef}>
              <button 
                className="actions-button"
                onClick={handleActionsClick}
              >
                ⋯
              </button>
              <div className={`actions-menu ${showActions ? 'open' : ''}`}>
                <button onClick={() => onViewDetails(product)} className="action-item view">
                  <FiEye /> View Details
                </button>
                <button onClick={() => onEditProduct(product)} className="action-item edit">
                  <FiEdit /> Edit Product
                </button>
                <button onClick={() => onDeleteProduct(product)} className="action-item delete">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sell-card-content">
        <div className="sell-card-header">
          <h3 className="sell-card-name">
            {product.name || "Unknown Product"}
            {product.variant && ` (${product.variant})`}
          </h3>
          <p className="sell-card-price">₹{product.price || 0}</p>
        </div>

        <div className="sell-card-details">
          <div className="detail-row">
            <span className="detail-label">Condition:</span>
            <span 
              className="detail-value condition-badge"
              style={{ backgroundColor: getConditionColor(product.condition) }}
            >
              {(product.condition || 'good').toUpperCase()}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{product.category || 'General'}</span>
          </div>

          {product.description && (
            <div className="detail-row description">
              <span className="detail-label">Description:</span>
              <p className="detail-value description-text">{product.description}</p>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Listed:</span>
            <span className="detail-value">{formatDate(product.createdAt || new Date())}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Seller:</span>
            <span className="detail-value seller-info">
              {product.sellerName || 'Anonymous'}
              {product.sellerBranch && ` (${product.sellerBranch})`}
            </span>
          </div>
        </div>

        <div className="sell-card-actions">
          {!isOwner ? (
            <button className="contact-seller-btn">
              Contact Seller
            </button>
          ) : (
            <div className="owner-stats">
              <span className="views-count">👁 {product.views || 0} views</span>
              <span className="inquiries-count">💬 {product.inquiries || 0} inquiries</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellCard;