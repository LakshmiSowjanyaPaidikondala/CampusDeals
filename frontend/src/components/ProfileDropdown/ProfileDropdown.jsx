import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  FaUser, 
  FaShoppingCart, 
  FaHistory, 
  FaCog, 
  FaSignOutAlt,
  FaChevronDown 
} from 'react-icons/fa';


const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Get user data and logout function from auth context
  const { user, logout: authLogout, isAuthenticated, isLoading } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    // Call the logout function from auth context
    authLogout();
    setShowLogoutModal(false);
    // Navigate to login page after logout
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Don't render if user is not authenticated or still loading
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      {/* Profile Icon/Button */}
      <button 
        className="profile-button"
        onClick={toggleDropdown}
        aria-label="Profile menu"
      >
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.user_name || user.name} />
          ) : (
            <span className="avatar-initials">{getInitials(user.user_name || user.name)}</span>
          )}
        </div>
        <FaChevronDown 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {/* User Info Section */}
          <div className="user-info">
            <div className="user-avatar-large">
              {user.avatar ? (
                <img src={user.avatar} alt={user.user_name || user.name} />
              ) : (
                <span className="avatar-initials-large">{getInitials(user.user_name || user.name)}</span>
              )}
            </div>
            <div className="user-details">
              <h4>{user.user_name || user.name}</h4>
              <p>{user.user_email || user.email}</p>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Menu Items */}
          <div className="dropdown-items">
            <Link 
              to="/profile" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaUser className="item-icon" />
              <span>My Profile</span>
            </Link>

            <Link 
              to="/cart" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaShoppingCart className="item-icon" />
              <span>Cart</span>
              {user.cartItems && user.cartItems > 0 && (
                <span className="badge">{user.cartItems}</span>
              )}
            </Link>

            <Link 
              to="/orders" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaHistory className="item-icon" />
              <span>Order History</span>
              {user.orderCount && (
                <span className="order-count">({user.orderCount})</span>
              )}
            </Link>

            <Link 
              to="/settings" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaCog className="item-icon" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="dropdown-divider"></div>

          {/* Logout */}
          <button 
            className="dropdown-item logout-item"
            onClick={handleLogoutClick}
          >
            <FaSignOutAlt className="item-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" style={{zIndex: 99999}} onClick={cancelLogout}>
          <div className="logout-modal" style={{zIndex: 100000}} onClick={e => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon-wrapper">
                <FaSignOutAlt className="logout-modal-icon" />
              </div>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="logout-modal-body">
              <p>You will be signed out of your account and redirected to the login page.</p>
              <p><strong>Note:</strong> Any unsaved changes will be lost.</p>
            </div>
            <div className="logout-modal-actions">
              <button 
                className="logout-cancel-btn"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn"
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;