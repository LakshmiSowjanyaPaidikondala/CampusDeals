// Cart Service for API integration
import { getProductImage } from '../utils/imageUtils';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Add item to cart (backend)
export const addToCartAPI = async (productId, quantity = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add item to cart');
    }

    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Get cart items (backend)
export const getCartItemsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch cart items');
    }

    return data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Update cart item quantity (backend)
export const updateCartItemAPI = async (productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update cart item');
    }

    return data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart (backend)
export const removeFromCartAPI = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove item from cart');
    }

    return data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Clear entire cart (backend)
export const clearCartAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear cart');
    }

    return data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Transform backend cart item to frontend format
export const transformCartItem = (backendItem, type = 'buy') => {
  // Ensure backendItem exists and has required properties
  if (!backendItem) {
    console.error('transformCartItem: backendItem is null or undefined');
    return null;
  }

  // Debug: Log the incoming backend item
  console.log('Transform - backend item:', backendItem);

  // Backend formats product_price as price_per_item in the response
  const price = parseFloat(backendItem.price_per_item || backendItem.product_price) || 0;
  const quantity = parseInt(backendItem.quantity) || 1;
  
  // Debug: Log the extracted price
  console.log('Transform - extracted price:', price, 'from price_per_item:', backendItem.price_per_item, 'or product_price:', backendItem.product_price);
  
  return {
    id: backendItem.product_id || 0,
    name: backendItem.product_name || 'Unknown Product',
    variant: backendItem.product_variant || 'Default',
    price: price,
    originalPrice: 0, // Set to 0 for now as requested
    quantity: quantity,
    stock: parseInt(backendItem.stock_quantity) || 99, // Default stock if not provided
    inStock: parseInt(backendItem.stock_quantity) || 99,
    productCode: backendItem.product_code || '',
    image: getProductImage(backendItem.product_images),
    description: `${backendItem.product_name || 'Unknown'} - ${backendItem.product_variant || 'Default'}`,
    seller: type === 'buy' ? 'Campus Deals' : 'Your Items',
    category: backendItem.product_name || 'Uncategorized',
    subcategory: backendItem.product_variant || 'Default',
    type: type,
    itemTotal: parseFloat(backendItem.item_total) || (price * quantity)
  };
};
