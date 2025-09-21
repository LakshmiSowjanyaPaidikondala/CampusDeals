
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Map image filenames to actual imported images
    const imageMap = {
      'Calci.jpg': calciImg,
      'Drafter.jpeg': drafterImg,
      'chart holder.jpg': chartHolderImg,
      'Mechanical.jpeg': mechCoatImg,
      'Chemical.jpeg': chemCoatImg
    };

    const fetchProducts = async () => {
      try {
        console.log('🚀 Fetching products from API...');
        console.log('🌐 API URL:', "http://localhost:5000/api/products");
        
        const response = await fetch("http://localhost:5000/api/products", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log('📡 Response status:', response.status);
        console.log('✅ Response ok:', response.ok);
        console.log('📋 Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw API Response data:', data);
        
        // Handle both array and object responses
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        console.log('🔄 Products array:', productsArray);
        
        // Map the image URLs to local imports
        const productsWithImages = productsArray.map(product => ({
          ...product,
          image: imageMap[product.image] || product.image,
          // Ensure all required fields exist
          id: product.id || product.product_id,
          name: product.name || product.product_name,
          price: product.price || product.product_price,
          stock: product.stock || product.quantity
        }));
        
        console.log('🖼️ Products with images:', productsWithImages);
        setProducts(productsWithImages);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(`Failed to fetch products: ${err.message}`);
        
        // Show fallback products so the page isn't empty
        console.log('🔄 Using fallback products...');
        const fallbackProducts = [
          { id: 1, name: "Scientific Calculator", price: 450, stock: 5, image: calciImg },
          { id: 2, name: "Engineering Drafter", price: 800, stock: 3, image: drafterImg },
          { id: 3, name: "Chemical Lab Coat", price: 250, stock: 8, image: chemCoatImg },
          { id: 4, name: "Mechanical Lab Coat", price: 250, stock: 3, image: mechCoatImg }
        ];
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
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
          Proceed to Buy
        </button>
      </div>

      {/* 📝 Buyer Form as Modal */}
      {/*{showForm && <BuyForm cart={cart} onClose={handleCloseForm} />}*/}
      
    </div>
  );
};

export default Buy;
