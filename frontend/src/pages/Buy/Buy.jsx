import React, { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import BuyForm from "../UserForm/UserForm";
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

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching products from API...');
      
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log('✅ Products fetched:', data.products);
        setProducts(data.products);
        
        // Group products by name for variant display
        const grouped = groupProductsByName(data.products);
        console.log('✅ Grouped products:', grouped);
        setGroupedProducts(grouped);
        
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(`Failed to load products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleProceed = () => {
    if (cart.length > 0) {
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const filteredProducts = groupedProducts.filter((p) =>
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
            <ProductCard key={`${item.name}-${index}`} product={item} onAddToCart={handleAddToCart} />
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