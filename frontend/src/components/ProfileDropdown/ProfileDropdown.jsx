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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Get token from multiple possible storage keys
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('accessToken');
      
      if (token) {
        // Make API call to logout endpoint with enhanced error handling
        const response = await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            deviceInfo: navigator.userAgent
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Successfully logged out from server:', result.message || 'Logout successful');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.warn('Server logout failed:', errorData.message || `Status: ${response.status}`);
        }
      }
      
      // Enhanced loading animation delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Show success feedback briefly before logout
      console.log('🚀 Logout process completed successfully!');
      
      // Add success visual feedback
      const modalElement = document.querySelector('.logout-modal');
      if (modalElement) {
        modalElement.style.animation = 'modalSuccessOut 0.4s ease-in-out forwards';
      }
      
      // Small delay for success animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Comprehensive cleanup of all authentication data
      const keysToRemove = [
        'cartItems', 'userData', 'authToken', 'token', 
        'accessToken', 'refreshToken', 'user', 'userProfile'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 Cleared ${key} from localStorage`);
        }
      });
      
      // Call the logout function from auth context
      authLogout();
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      
      // Show success message
      console.log('Successfully logged out');
      
      // Navigate to login page after logout
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still proceed with local logout even if API call fails
      localStorage.removeItem('cartItems');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      
      authLogout();
      setShowLogoutModal(false);
      setIsLoggingOut(false);
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
        <div 
          className="logout-modal-overlay" 
          onClick={cancelLogout}
          style={{
            background: `
              conic-gradient(from 45deg at 10% 10%, rgba(255, 71, 87, 0.15) 0deg, transparent 60deg),
              conic-gradient(from 225deg at 90% 90%, rgba(74, 144, 226, 0.15) 0deg, transparent 60deg),
              conic-gradient(from 135deg at 70% 30%, rgba(168, 85, 247, 0.10) 0deg, transparent 45deg),
              radial-gradient(ellipse 1200px 600px at 25% 0%, rgba(139, 69, 19, 0.08) 0%, transparent 70%),
              radial-gradient(ellipse 800px 1200px at 100% 100%, rgba(220, 38, 127, 0.08) 0%, transparent 70%),
              radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.3) 0%, transparent 80%),
              linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.94) 20%, rgba(51, 65, 85, 0.96) 40%, rgba(30, 41, 59, 0.94) 60%, rgba(15, 23, 42, 0.92) 80%, rgba(0, 0, 0, 0.88) 100%)
            `,
            backdropFilter: 'blur(35px) saturate(1.4) brightness(0.85) contrast(1.1)',
            WebkitBackdropFilter: 'blur(35px) saturate(1.4) brightness(0.85) contrast(1.1)'
          }}
        >
          <div 
            className="logout-modal" 
            onClick={e => e.stopPropagation()}
            style={{
              background: `
                radial-gradient(circle at 15% 15%, rgba(255, 71, 87, 0.12) 0%, transparent 35%),
                radial-gradient(circle at 85% 85%, rgba(74, 144, 226, 0.12) 0%, transparent 35%),
                radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 30% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 30%),
                conic-gradient(from 45deg at 25% 25%, rgba(251, 191, 36, 0.08) 0deg, transparent 30deg),
                linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 252, 255, 0.99) 15%, rgba(252, 251, 255, 0.99) 30%, rgba(250, 250, 255, 1.0) 50%, rgba(252, 251, 255, 0.99) 70%, rgba(254, 252, 255, 0.99) 85%, rgba(255, 255, 255, 0.98) 100%)
              `,
              borderRadius: '32px',
              boxShadow: `
                0 50px 100px rgba(0, 0, 0, 0.3),
                0 30px 60px rgba(0, 0, 0, 0.2),
                0 20px 40px rgba(0, 0, 0, 0.15),
                0 10px 20px rgba(0, 0, 0, 0.1),
                0 5px 10px rgba(0, 0, 0, 0.05),
                inset 0 4px 0 rgba(255, 255, 255, 0.95),
                inset 0 2px 8px rgba(255, 255, 255, 0.8),
                inset 0 0 0 3px rgba(255, 255, 255, 0.6),
                inset 0 -3px 0 rgba(0, 0, 0, 0.04)
              `,
              maxWidth: '520px',
              minWidth: '420px',
              width: '90vw',
              border: '4px solid rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(20px) saturate(1.2) brightness(1.05)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.2) brightness(1.05)'
            }}
          >
            <div 
              className="logout-modal-header"
              style={{
                textAlign: 'center',
                padding: '3.5rem 3rem 2.5rem',
                background: `
                  radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.15) 0%, transparent 60%),
                  radial-gradient(ellipse at bottom right, rgba(255, 107, 107, 0.2) 0%, transparent 50%),
                  linear-gradient(135deg, #ff4757 0%, #ff3742 15%, #ff6b6b 30%, #ff5722 45%, #e53e3e 60%, #dc2626 75%, #b91c1c 90%, #991b1b 100%)
                `,
                color: 'white',
                borderRadius: '28px 28px 0 0',
                boxShadow: `
                  inset 0 3px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.1),
                  0 8px 32px rgba(220, 38, 38, 0.3)
                `
              }}
            >
              <div className="logout-icon-wrapper">
                <FaSignOutAlt 
                  className="logout-modal-icon" 
                  style={{
                    fontSize: '3.5rem',
                    filter: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                    textShadow: '0 3px 6px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </div>
              <h3 
                style={{
                  margin: '0 0 1rem',
                  fontSize: '2rem',
                  fontWeight: '900',
                  textShadow: '0 3px 6px rgba(0, 0, 0, 0.4), 0 6px 12px rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.25)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                Confirm Logout
              </h3>
              <p 
                style={{
                  margin: '0',
                  fontSize: '1.2rem',
                  opacity: '0.98',
                  fontWeight: '600',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)',
                  letterSpacing: '0.3px'
                }}
              >
                Are you sure you want to logout?
              </p>
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
              
            </div>
            <div className="logout-modal-actions" style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
              <button 
                className="logout-cancel-btn"
                onClick={cancelLogout}
                style={{
                  flex: '1',
                  padding: '1.2rem 2rem',
                  border: 'none',
                  borderRadius: '18px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f1f3f4 50%, #e3e6e8 100%)',
                  color: '#333',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                style={{
                  flex: '1',
                  padding: '1.2rem 2rem',
                  border: '3px solid rgba(255, 71, 87, 0.5)',
                  borderRadius: '18px',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: `
                    radial-gradient(ellipse at top, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
                    linear-gradient(135deg, #ff4757 0%, #ff3b47 15%, #ff2837 30%, #e53e3e 45%, #dc2626 60%, #b91c1c 75%, #991b1b 90%, #7f1d1d 100%)
                  `,
                  color: 'white',
                  boxShadow: `
                    0 12px 35px rgba(255, 71, 87, 0.6),
                    0 8px 25px rgba(220, 38, 38, 0.4),
                    0 4px 15px rgba(185, 28, 28, 0.3),
                    inset 0 3px 0 rgba(255, 255, 255, 0.3),
                    inset 0 -3px 0 rgba(0, 0, 0, 0.2),
                    inset 0 1px 15px rgba(255, 255, 255, 0.1)
                  `,
                  opacity: isLoggingOut ? 0.8 : 1,
                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {isLoggingOut ? (
                  <>
                    <span className="logout-spinner"></span>
                    Logging out...
                  </>
                ) : (
                  'Yes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;