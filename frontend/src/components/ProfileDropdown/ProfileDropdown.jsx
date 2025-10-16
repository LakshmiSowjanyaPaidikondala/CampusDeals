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
    try {
      // Clear any local storage data
      localStorage.removeItem('cartItems');
      localStorage.removeItem('userData');
      
      // Call the logout function from auth context
      authLogout();
      setShowLogoutModal(false);
      
      // Show success message (optional)
      console.log('Successfully logged out');
      
      // Navigate to login page after logout
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still proceed with logout even if there's an error
      authLogout();
      setShowLogoutModal(false);
      navigate('/login');
    }
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="profile-dropdown">
        <div className="profile-button loading">
          <div className="profile-avatar loading-avatar">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // For testing purposes, use mock user data if not authenticated
  const mockUser = {
    user_name: 'John Doe',
    user_email: 'john.doe@campus.edu',
    user_college: 'Campus University',
    user_branch: 'Computer Science',
    user_studyyear: '3rd Year',
    cartItems: 5,
    orderCount: 12
  };

  const displayUser = user || mockUser;

  // For testing purposes, always show dropdown
  // In production, you can enable this check: if (!isAuthenticated) { return login prompt }
  const showLoginPrompt = false; // Set to true to show login prompt
  
  if (showLoginPrompt) {
    return (
      <div className="profile-dropdown">
        <Link to="/login" className="profile-button login-prompt">
          <div className="profile-avatar">
            <span className="avatar-initials">?</span>
          </div>
          <span className="login-text">Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      {/* Profile Icon/Button */}
      <button 
        className="profile-button"
        onClick={toggleDropdown}
        aria-label="Profile menu"
        style={{
          border: isOpen ? '2px solid #ff6b6b' : '2px solid rgba(255,255,255,0.3)',
          position: 'relative'
        }}
      >
        <div className="profile-avatar">
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt={displayUser.user_name} />
          ) : (
            <span className="avatar-initials">{getInitials(displayUser.user_name)}</span>
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
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.user_name} />
              ) : (
                <span className="avatar-initials-large">{getInitials(displayUser.user_name)}</span>
              )}
            </div>
            <div className="user-details">
              <h4>{displayUser.user_name || 'Campus User'}</h4>
              <p className="user-email">{displayUser.user_email || 'user@campus.edu'}</p>
              {displayUser.user_college && (
                <p className="user-college">{displayUser.user_college}</p>
              )}
              {displayUser.user_branch && (
                <p className="user-branch">{displayUser.user_branch} - Year {displayUser.user_studyyear || 'N/A'}</p>
              )}
              <p className="user-status">
                <span className="status-indicator"></span>
                Online
              </p>
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
              {displayUser.cartItems && displayUser.cartItems > 0 && (
                <span className="badge">{displayUser.cartItems}</span>
              )}
            </Link>

            <Link 
              to="/orders" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaHistory className="item-icon" />
              <span>Order History</span>
              {displayUser.orderCount && (
                <span className="order-count">({displayUser.orderCount})</span>
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
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon-wrapper">
                <FaSignOutAlt className="logout-modal-icon" />
              </div>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="logout-modal-body">
              <div className="logout-user-info">
                <div className="logout-user-avatar">
                  {displayUser.avatar ? (
                    <img src={displayUser.avatar} alt={displayUser.user_name} />
                  ) : (
                    <span className="logout-avatar-initials">{getInitials(displayUser.user_name)}</span>
                  )}
                </div>
                <div className="logout-user-details">
                  <h4>{displayUser.user_name}</h4>
                  <p>{displayUser.user_email}</p>
                </div>
              </div>
              <p>You will be signed out of your account and redirected to the login page.</p>
              <div className="logout-warning">
                <strong>⚠️ Note:</strong> Any unsaved changes will be lost.
              </div>
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