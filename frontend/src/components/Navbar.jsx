import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "../index.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      {/* Logo Section */}
      <div className="logo-container">
        <div className="logo-wrapper">
          <img src={logo} alt="Campus Deals Logo" className="logo" />
        </div>
        <h1 className="logo-text">Campus Deals</h1>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
        >
          <span>Home</span>
        </Link>
        <Link 
          to="/buy" 
          className={`nav-link ${location.pathname === '/buy' ? 'nav-link-active' : ''}`}
        >
          <span>Buy</span>
        </Link>
        <Link 
          to="/sell" 
          className={`nav-link ${location.pathname === '/sell' ? 'nav-link-active' : ''}`}
        >
          <span>Sell</span>
        </Link>
        <Link 
          to="/tips" 
          className={`nav-link ${location.pathname === '/tips' ? 'nav-link-active' : ''}`}
        >
          <span>Tips</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;