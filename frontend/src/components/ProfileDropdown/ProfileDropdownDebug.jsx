import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileDropdownDebug.css';
import { useAuth } from '../../hooks/useAuth.jsx';
import { 
  FaUser, 
  FaShoppingCart, 
  FaHistory, 
  FaFileContract, 
  FaSignOutAlt,
  FaChevronDown 
} from 'react-icons/fa';

const ProfileDropdownDebug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Get user data and logout function from auth context
  const { user, logout: authLogout, isAuthenticated, isLoading } = useAuth();

  // Use real user data only
  const displayUser = user;

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
    console.log('Dropdown toggled, isOpen:', !isOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    try {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('userData');
      
      if (authLogout) {
        authLogout();
      }
      setShowLogoutModal(false);
      
      console.log('Successfully logged out');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
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
        <div style={{color: 'white', fontSize: '12px', marginTop: '5px'}}>Loading...</div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  console.log('Rendering ProfileDropdown', {
    user: displayUser,
    isAuthenticated,
    isOpen,
    isLoading
  });

  return (
    <>
      <div className="profile-dropdown" ref={dropdownRef}>

        {/* Profile Icon/Button */}
        <button 
          className="profile-button"
          onClick={toggleDropdown}
          aria-label="Profile menu"
          style={{
            border: isOpen ? '2px solid #ff6b6b' : '2px solid transparent',
            position: 'relative'
          }}
        >
          <div className="profile-avatar">
            {displayUser?.avatar ? (
              <img src={displayUser.avatar} alt={displayUser.user_name || displayUser.name} />
            ) : (
              <span className="avatar-initials">{getInitials(displayUser?.user_name || displayUser?.name)}</span>
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        <div className={`dropdown-menu ${isOpen ? 'visible' : 'hidden'}`} style={{
          display: 'block',
          visibility: isOpen ? 'visible' : 'hidden',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s ease'
        }}>
          {/* User Info Section */}
          <div className="user-info">
            <div className="user-avatar-large">
              {displayUser?.avatar ? (
                <img src={displayUser.avatar} alt={displayUser.user_name || displayUser.name} />
              ) : (
                <span className="avatar-initials-large">{getInitials(displayUser?.user_name || displayUser?.name)}</span>
              )}
            </div>
            <div className="user-details">
              <h4>{displayUser?.user_name || displayUser?.name || 'Campus User'}</h4>
              <p className="user-email">{displayUser?.user_email || displayUser?.email}</p>
              {displayUser?.user_college && (
                <p className="user-college">{displayUser.user_college}</p>
              )}
              {displayUser?.user_branch && (
                <p className="user-branch">{displayUser.user_branch} - Year {displayUser.user_year || 'N/A'}</p>
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
              {displayUser?.cartItems && displayUser.cartItems > 0 && (
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
              {displayUser?.orderCount && (
                <span className="order-count">({displayUser.orderCount})</span>
              )}
            </Link>

            <Link 
              to="/terms" 
              className="dropdown-item"
              onClick={closeDropdown}
            >
              <FaFileContract className="item-icon" />
              <span>Terms & Conditions</span>
            </Link>
            <button 
            className="dropdown-item logout-item"
            onClick={handleLogoutClick}
          >
            <FaSignOutAlt className="item-icon" />
            <span>Logout</span>
          </button>
          </div>

          {/* <div className="dropdown-divider"></div> */}

          {/* Logout */}
          {/* <button 
            className="dropdown-item logout-item"
            onClick={handleLogoutClick}
          >
            <FaSignOutAlt className="item-icon" />
            <span>Logout</span>
          </button> */}
        </div>
      </div>

      {/* Logout Confirmation Modal - Rendered via Portal */}
      {showLogoutModal && createPortal(
        <div className="logout-modal-overlay" style={{zIndex: 99999}} onClick={cancelLogout}>
          <div className="logout-modal" style={{zIndex: 100000}} onClick={e => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon-wrapper">
                <FaSignOutAlt className="logout-modal-icon" />
              </div>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
            </div>
            
            <div className="logout-modal-actions">
              <button 
                className="logout-confirm-btn"
                onClick={confirmLogout}
              >
                Yes
              </button>
              <button 
                className="logout-cancel-btn"
                onClick={cancelLogout}
              >
                <span>No</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProfileDropdownDebug;