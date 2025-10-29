import { getToken } from './auth.js';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Buy Cart API functions
export const buyCartAPI = {
  // Add item to buy cart
  addItem: async (productId, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    return handleResponse(response);
  },

  // Get all buy cart items
  getItems: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/buy`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const result = await handleResponse(response);
    console.log('Buy cart API response:', result);
    return result;
  },

  // Update buy cart item quantity
  updateItem: async (productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    return handleResponse(response);
  },

  // Remove item from buy cart
  removeItem: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Clear entire buy cart
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Batch update multiple items
  batchUpdate: async (items) => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/batch-update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(response);
  },

  // Batch remove multiple items
  batchRemove: async (productIds) => {
    const response = await fetch(`${API_BASE_URL}/cart/buy/batch-remove`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_ids: productIds })
    });
    return handleResponse(response);
  }
};

// Sell Cart API functions
export const sellCartAPI = {
  // Add item to sell cart
  addItem: async (productId, quantity = 1) => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    return handleResponse(response);
  },

  // Get all sell cart items
  getItems: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/sell`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const result = await handleResponse(response);
    console.log('Sell cart API response:', result);
    return result;
  },

  // Update sell cart item quantity
  updateItem: async (productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });
    return handleResponse(response);
  },

  // Remove item from sell cart
  removeItem: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Clear entire sell cart
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Batch update multiple items
  batchUpdate: async (items) => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/batch-update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(response);
  },

  // Batch remove multiple items
  batchRemove: async (productIds) => {
    const response = await fetch(`${API_BASE_URL}/cart/sell/batch-remove`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_ids: productIds })
    });
    return handleResponse(response);
  }
};

// Combined cart operations for convenience
export const cartAPI = {
  // Get both buy and sell cart items
  getAllCarts: async () => {
    try {
      const [buyCartResponse, sellCartResponse] = await Promise.all([
        buyCartAPI.getItems().catch(err => {
          console.warn('Buy cart fetch failed:', err);
          return { data: { items: [], total_items: 0, total_cost: 0 } };
        }),
        sellCartAPI.getItems().catch(err => {
          console.warn('Sell cart fetch failed:', err);
          return { data: { items: [], total_items: 0, total_cost: 0 } };
        })
      ]);
      
      return {
        buyCart: buyCartResponse.data || { items: [], total_items: 0, total_cost: 0 },
        sellCart: sellCartResponse.data || { items: [], total_items: 0, total_cost: 0 }
      };
    } catch (error) {
      console.error('Error fetching carts:', error);
      return {
        buyCart: { items: [], total_items: 0, total_cost: 0 },
        sellCart: { items: [], total_items: 0, total_cost: 0 }
      };
    }
  }
};