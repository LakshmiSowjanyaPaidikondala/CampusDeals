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

// =======================
// BUY CART API FUNCTIONS
// =======================

// Add item to buy cart
export const addToBuyCartAPI = async (productId, quantity = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/buy/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add item to buy cart');
    }

    return data;
  } catch (error) {
    console.error('Error adding to buy cart:', error);
    throw error;
  }
};

// Get buy cart items
export const getBuyCartItemsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/buy`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch buy cart items');
    }

    return data;
  } catch (error) {
    console.error('Error fetching buy cart items:', error);
    throw error;
  }
};

// Update buy cart item quantity
export const updateBuyCartItemAPI = async (productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/buy/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update buy cart item');
    }

    return data;
  } catch (error) {
    console.error('Error updating buy cart item:', error);
    throw error;
  }
};

// Remove item from buy cart
export const removeFromBuyCartAPI = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/buy/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove item from buy cart');
    }

    return data;
  } catch (error) {
    console.error('Error removing from buy cart:', error);
    throw error;
  }
};

// Clear entire buy cart
export const clearBuyCartAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/buy/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear buy cart');
    }

    return data;
  } catch (error) {
    console.error('Error clearing buy cart:', error);
    throw error;
  }
};

// ========================
// SELL CART API FUNCTIONS
// ========================

// Add item to sell cart
export const addToSellCartAPI = async (productId, quantity = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/sell/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add item to sell cart');
    }

    return data;
  } catch (error) {
    console.error('Error adding to sell cart:', error);
    throw error;
  }
};

// Get sell cart items
export const getSellCartItemsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/sell`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch sell cart items');
    }

    return data;
  } catch (error) {
    console.error('Error fetching sell cart items:', error);
    throw error;
  }
};

// Update sell cart item quantity
export const updateSellCartItemAPI = async (productId, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/sell/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update sell cart item');
    }

    return data;
  } catch (error) {
    console.error('Error updating sell cart item:', error);
    throw error;
  }
};

// Remove item from sell cart
export const removeFromSellCartAPI = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/sell/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove item from sell cart');
    }

    return data;
  } catch (error) {
    console.error('Error removing from sell cart:', error);
    throw error;
  }
};

// Clear entire sell cart
export const clearSellCartAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/sell/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear sell cart');
    }

    return data;
  } catch (error) {
    console.error('Error clearing sell cart:', error);
    throw error;
  }
};

// =========================
// SHARED UTILITY FUNCTIONS
// =========================

// Transform backend cart item to frontend format
export const transformCartItem = (backendItem, type = 'buy') => {
  // Ensure backendItem exists and has required properties
  if (!backendItem) {
    console.error('transformCartItem: backendItem is null or undefined');
    return null;
  }

  // Backend formats product_price as price_per_item in the response
  const price = parseFloat(backendItem.price_per_item || backendItem.product_price) || 0;
  const quantity = parseInt(backendItem.quantity) || 1;
  
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