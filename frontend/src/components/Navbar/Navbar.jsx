import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import logo from "../../assets/logo.png";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdownDebug";
import { useCart } from "../../contexts/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Get cart count from context
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  // Function to handle navigation with scroll to top
  const handleNavigation = (path, event) => {
    // Close mobile menu if open
    setMenuOpen(false);
    
    // If we're already on the same page, scroll to top
    if (location.pathname === path) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // For navigation to different pages, scroll will be handled by the useEffect below
      // The navigation will happen normally via the Link component
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/buy', label: 'Buy' },
    { path: '/sell', label: 'Sell' },
    { path: '/tips', label: 'Tips' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      {/* Left side with logo + hamburger */}
      <div className="nav-left">
        <button
          className="hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
        <Link to="/" className="logo-container" onClick={(e) => handleNavigation('/', e)}>
          <div className="logo-wrapper">
            <img src={logo} alt="Campus Deals Logo" className="logo" />
          </div>
          <h1 className="logo-text">Campus Deals</h1>
        </Link>
      </div>

      {/* Right side with Desktop Links, Cart and Profile */}
      <div className="nav-right">
        {/* Desktop Links with Equal Spacing */}
        <div className="nav-links desktop">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "nav-link-active" : ""
              }`}
              onClick={(e) => handleNavigation(item.path, e)}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Premium Cart Icon */}
        <Link to="/cart" className="cart-link" onClick={(e) => handleNavigation('/cart', e)}>
          <ShoppingCart className="cart-icon" size={24} />
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </Link>

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar for Mobile */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button
          className="close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Close mobile menu"
        >
          ✕
        </button>

        {/* Profile section in mobile sidebar */}
        <div className="sidebar-profile">
          <ProfileDropdown />
        </div>

        {/* Cart in mobile sidebar */}
        <div className="sidebar-cart">
          <Link 
            to="/cart" 
            className="sidebar-cart-link" 
            onClick={(e) => handleNavigation('/cart', e)}
          >
            <ShoppingCart size={18} />
            <span>Cart ({cartCount})</span>
          </Link>
        </div>

        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={(e) => handleNavigation(item.path, e)}
                className={location.pathname === item.path ? "active" : ""}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;