import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import ProductCard from "../../components/ProductCard/ProductCard";
import BuyForm from "../UserForm/UserForm";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../hooks/useAuth.jsx";
import Toast from "../../components/Toast/Toast"; // Add this import
import "./Buy.css";

import calciImg from "../../assets/Calci.jpg";
import drafterImg from "../../assets/Drafter.jpeg";
import chartHolderImg from "../../assets/chart holder.jpg";
import mechCoatImg from "../../assets/Mechanical.jpeg";
import chemCoatImg from "../../assets/Chemical.jpeg";

const Buy = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToBuyCart, buyCartItems, getBuyCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success"
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  // Image mapping for products
  const productImages = {
    calculator: calciImg,
    drafter: drafterImg,
    chartbox: chartHolderImg,
    white_lab_coat: chemCoatImg,
    brown_lab_coat: mechCoatImg
  };

  // Comprehensive product descriptions with detailed specifications
  const productDescriptions = {
    calculator: {
      main: "High-quality scientific calculators designed specifically for engineering, mathematics, and scientific computations.",
      
    },
    drafter: {
      main: "Professional-grade drafting instruments essential for precise engineering drawings, architectural designs, and technical illustrations.",
      
    },
    chartbox: {
      main: "Sturdy, portable chart holders designed for organizing and displaying technical drawings, blueprints, and presentation materials.",
      
    },
    white_lab_coat: {
      main: "Professional white lab coats meeting safety standards for chemistry, medical, and research laboratory environments.",
    
    },
    brown_lab_coat: {
      main: "Heavy-duty brown lab coats specifically designed for mechanical workshops, industrial labs, and engineering practicals.",
     
    }
  };

  // Detailed variant specifications and descriptions
  const variantDetails = {
    // Calculator variants
    'MS': {
      name: 'MS (Multi-function Scientific)'
      
    },
    'ES': {
      name: 'ES (Engineering Scientific)'
      
    },
    'ES-Plus': {
      name: 'ES-Plus (Engineering Scientific Plus)'
    },
    
    // Drafter variants
    'premium_drafter': {
      name: 'Premium Professional Drafter'
    },
    'standard_drafter': {
      name: 'Standard Engineering Drafter'
    },
    'budget_drafter': {
      name: 'Budget-Friendly Drafter'
    },
    
    // Lab coat size details
    'S': {
      name: 'Small Size'
     
    },
    'M': {
      name: 'Medium Size'
    },
    'L': {
      name: 'Large Size'
    },
    'XL': {
      name: 'Extra Large Size'
    },
    'XXL': {
      name: 'Double Extra Large Size'
    },
    
    // Chart holder variant
    'chart holder': {
      name: 'Standard Chart Holder'
    }
  };

  // Function to group products by name and create variants with detailed information
  const groupProductsByName = (productList) => {
    const grouped = {};
    
    productList.forEach(product => {
      const productName = product.product_name;
      
      if (!grouped[productName]) {
        grouped[productName] = {
          name: productName,
          image: productImages[productName] || calciImg,
          description: productDescriptions[productName] || {
            main: "Quality product for student use.",
            features: ["Durable construction", "Student-friendly design"],
            specifications: {},
            useCase: "Suitable for academic and professional use."
          },
          variants: []
        };
      }
      
      const variantInfo = variantDetails[product.product_variant] || {
        name: product.product_variant,
        description: "Quality variant for your needs",
        features: ["Standard quality", "Reliable performance"],
        bestFor: "General academic use"
      };
      
      grouped[productName].variants.push({
        id: product.product_id,
        variant: product.product_variant,
        price: product.product_price,
        stock: product.quantity,
        productCode: product.product_code,
        images: product.product_images,
        variantDetails: variantInfo
      });
    });
    
    return Object.values(grouped);
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type
    });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Close toast manually
  const closeToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching products from API...');
      console.log('🔗 API URL:', `${API_BASE_URL}/products`);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API response:', data);
      
      if (data.success && data.products) {
        console.log('✅ Products fetched:', data.products.length, 'products');
        setProducts(data.products);
        
        // Group products by name with all their variants
        const groupedProductsList = groupProductsByName(data.products);
        console.log('✅ Grouped products:', groupedProductsList.length, 'product groups');
        console.log('📊 Product grouping details:', groupedProductsList.map(p => ({ name: p.name, variants: p.variants.length })));
        setGroupedProducts(groupedProductsList);
        
        setError(null);
      } else {
        throw new Error(data.message || 'Invalid API response format');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to load products';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Loading sample data instead.';
        console.log('🔄 Loading fallback data...');
        
        // Load fallback data when API is unavailable - All 17 products from database
        const fallbackProducts = [
          // Drafter products
          { product_id: 1, product_name: 'drafter', product_variant: 'premium_drafter', product_price: 400, quantity: 15, product_code: 'DFT-P', product_images: 'Drafter.jpeg' },
          { product_id: 2, product_name: 'drafter', product_variant: 'standard_drafter', product_price: 350, quantity: 25, product_code: 'DFT-S', product_images: 'Drafter.jpeg' },
          { product_id: 3, product_name: 'drafter', product_variant: 'budget_drafter', product_price: 300, quantity: 30, product_code: 'DFT-B', product_images: 'Drafter.jpeg' },
          
          // White lab coat products
          { product_id: 4, product_name: 'white_lab_coat', product_variant: 'S', product_price: 230, quantity: 12, product_code: 'WLC-S', product_images: 'Chemical.jpeg' },
          { product_id: 5, product_name: 'white_lab_coat', product_variant: 'M', product_price: 230, quantity: 20, product_code: 'WLC-M', product_images: 'Chemical.jpeg' },
          { product_id: 6, product_name: 'white_lab_coat', product_variant: 'L', product_price: 230, quantity: 18, product_code: 'WLC-L', product_images: 'Chemical.jpeg' },
          { product_id: 7, product_name: 'white_lab_coat', product_variant: 'XL', product_price: 230, quantity: 10, product_code: 'WLC-XL', product_images: 'Chemical.jpeg' },
          { product_id: 8, product_name: 'white_lab_coat', product_variant: 'XXL', product_price: 230, quantity: 5, product_code: 'WLC-XXL', product_images: 'Chemical.jpeg' },
          
          // Brown lab coat products
          { product_id: 9, product_name: 'brown_lab_coat', product_variant: 'S', product_price: 230, quantity: 8, product_code: 'BLC-S', product_images: 'Mechanical.jpeg' },
          { product_id: 10, product_name: 'brown_lab_coat', product_variant: 'M', product_price: 230, quantity: 15, product_code: 'BLC-M', product_images: 'Mechanical.jpeg' },
          { product_id: 11, product_name: 'brown_lab_coat', product_variant: 'L', product_price: 230, quantity: 12, product_code: 'BLC-L', product_images: 'Mechanical.jpeg' },
          { product_id: 12, product_name: 'brown_lab_coat', product_variant: 'XL', product_price: 230, quantity: 7, product_code: 'BLC-XL', product_images: 'Mechanical.jpeg' },
          { product_id: 13, product_name: 'brown_lab_coat', product_variant: 'XXL', product_price: 230, quantity: 3, product_code: 'BLC-XXL', product_images: 'Mechanical.jpeg' },
          
          // Calculator products
          { product_id: 14, product_name: 'calculator', product_variant: 'MS', product_price: 950, quantity: 20, product_code: 'CALC-MS', product_images: 'Calci.jpg' },
          { product_id: 15, product_name: 'calculator', product_variant: 'ES', product_price: 950, quantity: 25, product_code: 'CALC-ES', product_images: 'Calci.jpg' },
          { product_id: 16, product_name: 'calculator', product_variant: 'ES-Plus', product_price: 1000, quantity: 15, product_code: 'CALC-ES-Plus', product_images: 'Calci.jpg' },
          
          // Chart box product
          { product_id: 17, product_name: 'chartbox', product_variant: 'chart holder', product_price: 60, quantity: 20, product_code: 'CRT', product_images: 'chart holder.jpg' }
        ];
        
        setProducts(fallbackProducts);
        // Group fallback products by name with all their variants
        const groupedFallbackProducts = groupProductsByName(fallbackProducts);
        console.log('✅ Grouped fallback products:', groupedFallbackProducts.length, 'product groups');
        console.log('📊 Fallback grouping details:', groupedFallbackProducts.map(p => ({ name: p.name, variants: p.variants.length })));
        setGroupedProducts(groupedFallbackProducts);
        setError(null); // Clear error when fallback works
        return;
      } else if (error.message.includes('HTTP')) {
        errorMessage = `Server error: ${error.message}`;
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddToCart = (product) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate('/login');
      return;
    }

    // Add product with proper structure for buy cart
    const cartItem = {
      id: product.id,
      name: product.name,
      variant: product.variant,
      price: product.price,
      originalPrice: product.price * 1.2, // Add some savings
      stock: product.stock,
      inStock: product.stock,
      productCode: product.productCode,
      image: product.image,
      description: `${product.name} - ${product.variant}`,
      seller: 'Campus Deals',
      category: product.name,
      type: 'buy'
    };
    
    addToBuyCart(cartItem);
    
    // Show toast notification instead of alert
    showToast(`${product.name} (${product.variant}) added to buy cart!`);
  };

  // Handle quantity increase with toast
  const handleQuantityIncrease = (variant, newQuantity) => {
    const productName = variant.name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    showToast(`${productName} (${variant.variant}) quantity increased to ${newQuantity}!`);
  };

  // Handle quantity decrease with toast
  const handleQuantityDecrease = (variant, newQuantity) => {
    const productName = variant.name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    if (newQuantity === 0) {
      showToast(`${productName} (${variant.variant}) removed from cart!`, "info");
    } else {
      showToast(`${productName} (${variant.variant}) quantity decreased to ${newQuantity}!`);
    }
  };

  const handleProceed = () => {
    if (buyCartItems.length > 0) {
      navigate('/cart', { state: { activeTab: 'buy' } });
    }
  };

  const filteredProducts = groupedProducts.filter((p) =>
    p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="buy-page">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />

      {/* 🎯 Header Section with Title and Search */}
      <div className="buy-header">
        <div className="buy-title-section">
          <h1 className="buy-title">Student Deals</h1>
          <p className="buy-subtitle">Discover amazing deals on essential student items</p>
        </div>
        
        {/* 🔍 Search Bar */}
        <div className="search-bar">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 📢 Scrolling Message Banner */}
      <div className="scrolling-message-container">
        <div className="scrolling-message">
          <span className="message-item-buy">🎉 Welcome to Campus Deals! Get the best student essentials at unbeatable prices!</span>
        </div>
      </div>

      {/* 🛒 Product Grid */}
      <div className="products-grid">
        {loading ? (
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchProducts} className="retry-button">
              Retry Loading
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
            <ProductCard 
              key={`${item.name}-${index}`} 
              product={item} 
              onAddToCart={handleAddToCart}
              onQuantityIncrease={handleQuantityIncrease}
              onQuantityDecrease={handleQuantityDecrease}
              cartType="buy"
            />
          ))
        ) : (
          <div className="no-results">
            <p>No products found.</p>
            {searchTerm && (
              <p>Try searching with different keywords or <button onClick={() => setSearchTerm('')} className="clear-search">clear the search</button>.</p>
            )}
          </div>
        )}
      </div>

      {/* ✅ Buy Button */}

      {/* 📝 Buyer Form as Modal */}
      {/*{showForm && <BuyForm cart={cartItems} onClose={handleCloseForm} />}*/}
      
    </div>
  );
};

export default Buy;