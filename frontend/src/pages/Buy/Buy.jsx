import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import BuyForm from "../UserForm/UserForm";
import { isAuthenticated, saveCart, getCart } from "../../utils/auth";
import "./Buy.css";

import calciImg from "../../assets/Calci.jpg";
import drafterImg from "../../assets/Drafter.jpeg";
import chartHolderImg from "../../assets/chart holder.jpg";
import mechCoatImg from "../../assets/Mechanical.jpeg";
import chemCoatImg from "../../assets/Chemical.jpeg";

const Buy = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporarily bypass API and show products directly
    console.log('🚀 Loading products directly (bypassing API for testing)...');
    
    const directProducts = [
      { 
        id: 1, 
        name: "calculator", 
        variant: "Scientific Calculator", 
        price: 1200, 
        stock: 20, 
        image: calciImg 
      },
      { 
        id: 2, 
        name: "drafter", 
        variant: "Engineering Drafter", 
        price: 2500, 
        stock: 15, 
        image: drafterImg 
      },
      { 
        id: 3, 
        name: "white_lab_coat", 
        variant: "Chemical Lab Coat", 
        price: 450, 
        stock: 20, 
        image: chemCoatImg 
      },
      { 
        id: 4, 
        name: "brown_lab_coat", 
        variant: "Mechanical Lab Coat", 
        price: 500, 
        stock: 15, 
        image: mechCoatImg 
      },
      {
        id: 5,
        name: "chart_holder",
        variant: "Chart Holder",
        price: 300,
        stock: 10,
        image: chartHolderImg
      }
    ];
    
    setTimeout(() => {
      console.log('✅ Products loaded:', directProducts);
      setProducts(directProducts);
      setLoading(false);
      setError(null);
    }, 500); // Small delay to simulate loading
  }, []);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Restore cart from localStorage when component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      const savedCart = getCart();
      setCart(savedCart);
    }
  }, []);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      
      // Save cart to localStorage whenever it's updated
      saveCart(newCart);
      return newCart;
    });
  };

  const handleProceed = () => {
    if (cart.length > 0) {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Save cart to localStorage before redirecting
        saveCart(cart);
        // Redirect to login page
        navigate('/login');
      } else {
        setShowForm(true);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="buy-page">
      <h1 className="buy-title">Available Products</h1>

      {/* 🔍 Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🛒 Product Grid */}
      <div className="products-grid">
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="no-results">{error}</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </div>

      {/* ✅ Buy Button */}
      <div className="buy-button-container">
        <button
          className="buy-button"
          onClick={handleProceed}
          disabled={cart.length === 0}
        >
          Proceed to Buy ({cart.length} items)
        </button>
      </div>

      {/* 📝 Buyer Form as Modal */}
      {/*{showForm && <BuyForm cart={cart} onClose={handleCloseForm} />}*/}
      
    </div>
  );
};

export default Buy;
