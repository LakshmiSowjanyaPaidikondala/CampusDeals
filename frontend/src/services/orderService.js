// Order Service for API integration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Place a buy order
export const placeBuyOrder = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/buy-order`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to place buy order');
    }

    return data;
  } catch (error) {
    console.error('Error placing buy order:', error);
    throw error;
  }
};

// Place a sell order
export const placeSellOrder = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sell-order`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to place sell order');
    }

    return data;
  } catch (error) {
    console.error('Error placing sell order:', error);
    throw error;
  }
};

// Get user's orders
export const getMyOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/my-orders`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    return data.data || data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};